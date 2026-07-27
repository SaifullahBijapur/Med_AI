const { Type } = require("@google/genai");
const ai = require("../config/gemini");
const Hospital = require("../models/Hospital");

const DEFAULT_DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Gastroenterology",
  "Pulmonology",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
];

const analyzeSymptoms = async (symptoms, hospitalId = null) => {
  try {
    if (typeof symptoms === "string") {
      symptoms = symptoms.split(",").map((item) => item.trim());
    }

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      throw new Error("Symptoms are required");
    }

    symptoms = symptoms.filter(Boolean);

    // Get hospital-specific departments if available
    let departments = DEFAULT_DEPARTMENTS;
    if (hospitalId) {
      const hospital = await Hospital.findById(hospitalId);
      if (hospital && hospital.departments && hospital.departments.length > 0) {
        departments = hospital.departments;
      }
    }

    const prompt = `Triage a patient presenting with these symptoms: ${symptoms.join(", ")}.
Choose the single most appropriate department from: ${departments.join(", ")}.
Set "emergency" to true only for life-threatening or time-critical presentations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a clinical triage assistant. Be accurate and conservative: when symptoms are ambiguous or potentially serious, escalate severity. Keep 'reasoning' to one short sentence.",
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"],
            },
            department: {
              type: Type.STRING,
              enum: departments,
            },
            emergency: { type: Type.BOOLEAN },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence between 0 and 1.",
            },
            reasoning: {
              type: Type.STRING,
              description: "One short sentence explaining the triage decision.",
            },
          },
          required: ["severity", "department", "emergency"],
          propertyOrdering: [
            "severity",
            "department",
            "emergency",
            "confidence",
            "reasoning",
          ],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  analyzeSymptoms,
  DEFAULT_DEPARTMENTS,
};
