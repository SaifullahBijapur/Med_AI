const { Type } = require("@google/genai");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Bed = require("../models/Bed");
const Hospital = require("../models/Hospital");
const ai = require("../config/gemini");

const { analyzeSymptoms } = require("../services/triageAgent");
const { assignDoctor } = require("../services/doctorAssignmentService");
const { createAppointment } = require("../services/appointmentService");
const {
  getDashboardSummary,
  getExpenseSummary,
} = require("../services/analyticsService");

// Normalize a symptoms input (string or array) into a clean string array.
const toSymptomArray = (symptoms) => {
  if (typeof symptoms === "string") {
    symptoms = symptoms.split(",");
  }
  if (!Array.isArray(symptoms)) return [];
  return symptoms.map((s) => String(s).trim()).filter(Boolean);
};

const doctorPublic = (d) => ({
  id: d._id,
  name: d.name,
  department: d.department,
  specialization: d.specialization,
  available: d.available,
  rating: d.rating,
  currentQueueLoad: d.currentQueueLoad,
  patientsToday: d.patientsToday,
  maxPatientsPerDay: d.maxPatientsPerDay,
  shift: d.shift,
});

// Get hospital-specific departments
const getHospitalDepartments = async (hospitalId) => {
  if (!hospitalId) return ["Cardiology", "Neurology", "Orthopedics", "Gastroenterology", 
                            "Pulmonology", "Dermatology", "Pediatrics", "Gynecology"];
  const hospital = await Hospital.findById(hospitalId);
  return hospital?.departments || ["Cardiology", "Neurology", "Orthopedics", "Gastroenterology", 
                                   "Pulmonology", "Dermatology", "Pediatrics", "Gynecology"];
};

// ---- Tool implementations with hospital scope ----
const createToolImplementations = (hospitalId) => ({
  triage_symptoms: async ({ symptoms }) => {
    return await analyzeSymptoms(toSymptomArray(symptoms), hospitalId);
  },

  book_appointment: async ({ patientName, patientPhone, symptoms }) => {
    const symptomList = toSymptomArray(symptoms);
    if (!patientName || !patientPhone || symptomList.length === 0) {
      throw new Error(
        "patientName, patientPhone, and at least one symptom are required to book."
      );
    }

    const triage = await analyzeSymptoms(symptomList, hospitalId);
    const doctor = await assignDoctor(triage.department, triage.emergency, hospitalId);
    const appointmentId = `MH-${Date.now()}`;

    // Check if patient exists
    let patientId = null;
    const existingPatient = await Patient.findOne({ hospitalId, phone: patientPhone });
    if (existingPatient) patientId = existingPatient._id;

    const appointment = await createAppointment({
      hospitalId,
      appointmentId,
      patientId,
      patientName,
      patientPhone,
      symptoms: symptomList,
      doctor,
      triage,
    });

    return {
      triage,
      doctor: doctorPublic(doctor),
      appointment,
    };
  },

  find_available_doctor: async ({ department, emergency = false }) => {
    const doctor = await assignDoctor(department, emergency, hospitalId);
    return doctorPublic(doctor);
  },

  list_doctors: async ({ department, availableOnly = false } = {}) => {
    const query = { hospitalId, isActive: true };
    if (department) query.department = department;
    if (availableOnly) query.available = true;
    const doctors = await Doctor.find(query)
      .sort({ currentQueueLoad: 1 })
      .limit(50);
    return { count: doctors.length, doctors: doctors.map(doctorPublic) };
  },

  list_appointments: async ({
    status,
    department,
    emergency,
    limit = 10,
  } = {}) => {
    const query = { hospitalId };
    if (status) query.status = status;
    if (department) query.department = department;
    if (typeof emergency === "boolean") query.emergency = emergency;
    const appointments = await Appointment.find(query)
      .populate("doctorId", "name department")
      .populate("patientId", "fullName phone")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 10, 50));
    return { count: appointments.length, appointments };
  },

  search_patients: async ({ query }) => {
    const term = String(query || "").trim();
    if (!term) throw new Error("A search query is required.");
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\]/g, "\$&"), "i");
    const patients = await Patient.find({
      hospitalId,
      $or: [{ fullName: regex }, { phone: regex }, { patientCode: regex }],
    }).limit(20);
    return { count: patients.length, patients };
  },

  get_dashboard_analytics: async () => {
    return await getDashboardSummary(hospitalId);
  },

  get_expense_analytics: async () => {
    return await getExpenseSummary(hospitalId);
  },

  get_bed_status: async ({ wardName, status } = {}) => {
    const query = { hospitalId, isActive: true };
    if (wardName) query.wardName = wardName;
    if (status) query.status = status;
    const beds = await Bed.find(query)
      .populate("occupiedBy", "fullName patientCode")
      .sort({ wardName: 1, roomNumber: 1 });

    const stats = {
      total: beds.length,
      available: beds.filter(b => b.status === "available").length,
      occupied: beds.filter(b => b.status === "occupied").length,
      reserved: beds.filter(b => b.status === "reserved").length,
      maintenance: beds.filter(b => b.status === "maintenance").length,
    };

    return { stats, beds: beds.slice(0, 20) };
  },

  analyze_medical_report: async ({ fileUri, mimeType }) => {
    if (!fileUri || !mimeType) {
      throw new Error("fileUri and mimeType are required.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri,
                mimeType,
              },
            },
            {
              text: `Analyze this medical report and return a structured JSON with:
1. patientSummary - brief overview
2. keyFindings - main observations
3. abnormalValues - any out-of-range values
4. diagnoses - mentioned diagnoses
5. medications - prescribed medications
6. clinicalConcerns - areas needing attention
7. recommendedFollowup - suggested next steps

Return valid JSON only. Do not wrap in markdown.`,
            },
          ],
        },
      ],
    });

    return {
      analysis: response.text,
    };
  },
});

// ---- Gemini function declarations (schemas the model sees) ----
const createFunctionDeclarations = async (hospitalId) => {
  const departments = await getHospitalDepartments(hospitalId);

  return [
    {
      name: "triage_symptoms",
      description:
        "Analyze a patient's symptoms and return severity, the recommended department, and whether it is an emergency.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          symptoms: {
            type: Type.STRING,
            description: "Comma-separated list of the patient's symptoms.",
          },
        },
        required: ["symptoms"],
      },
    },
    {
      name: "analyze_medical_report",
      description:
        "Analyze uploaded medical reports, lab reports, prescriptions, discharge summaries, scans, and medical images.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          fileUri: {
            type: Type.STRING,
            description: "Gemini uploaded file URI",
          },
          mimeType: {
            type: Type.STRING,
            description: "File MIME type such as application/pdf or image/jpeg",
          },
        },
        required: ["fileUri", "mimeType"],
      },
    },
    {
      name: "book_appointment",
      description:
        "Book a hospital appointment end-to-end: triage the symptoms, assign the best available doctor, and create the appointment.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          patientName: { type: Type.STRING, description: "Full name of the patient." },
          patientPhone: { type: Type.STRING, description: "Patient phone number." },
          symptoms: {
            type: Type.STRING,
            description: "Comma-separated list of the patient's symptoms.",
          },
        },
        required: ["patientName", "patientPhone", "symptoms"],
      },
    },
    {
      name: "find_available_doctor",
      description:
        "Find the best available doctor for a department without booking anything.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          department: {
            type: Type.STRING,
            enum: departments,
            description: "Department to search for an available doctor.",
          },
          emergency: {
            type: Type.BOOLEAN,
            description: "Whether this is an emergency.",
          },
        },
        required: ["department"],
      },
    },
    {
      name: "list_doctors",
      description:
        "List doctors with queue load, availability, and capacity. Use for staff, capacity, and queue questions.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING, enum: departments },
          availableOnly: {
            type: Type.BOOLEAN,
            description: "If true, only return doctors currently marked available.",
          },
        },
      },
    },
    {
      name: "list_appointments",
      description:
        "List recent appointments, optionally filtered by status, department, or emergency flag.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          status: {
            type: Type.STRING,
            description: 'Appointment status, e.g. "Pending".',
          },
          department: { type: Type.STRING, enum: departments },
          emergency: { type: Type.BOOLEAN },
          limit: {
            type: Type.NUMBER,
            description: "Max number of appointments to return (default 10, max 50).",
          },
        },
      },
    },
    {
      name: "search_patients",
      description:
        "Search registered patients by name, phone, or patient code.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "Name, phone, or patient code to search for.",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_dashboard_analytics",
      description:
        "Get hospital-wide operational analytics: total doctors, patients, appointments, bed occupancy, and queue load.",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    {
      name: "get_expense_analytics",
      description:
        "Get expense analytics: total expenses, and breakdowns by department and category.",
      parameters: { type: Type.OBJECT, properties: {} },
    },
    {
      name: "get_bed_status",
      description:
        "Get bed availability status: total beds, occupied, available, reserved, and maintenance counts.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          wardName: { type: Type.STRING, description: "Filter by ward name" },
          status: { type: Type.STRING, enum: ["available", "occupied", "reserved", "maintenance"], description: "Filter by bed status" },
        },
      },
    },
  ];
};

// Export factory function that creates scoped implementations
module.exports = {
  createToolImplementations,
  createFunctionDeclarations,
  getHospitalDepartments,
};
