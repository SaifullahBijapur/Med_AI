const Doctor = require("../models/Doctor");

const assignDoctor = async (department, emergency = false, hospitalId = null) => {
  try {
    const query = { department, available: true, isActive: true };
    if (hospitalId) query.hospitalId = hospitalId;

    let doctor;

    if (emergency) {
      doctor = await Doctor.findOne(query).sort({
        currentQueueLoad: 1,
        emergencyCasesHandled: 1,
      });
    } else {
      doctor = await Doctor.findOne(query).sort({
        currentQueueLoad: 1,
        patientsToday: 1,
      });
    }

    if (!doctor) {
      throw new Error("No doctor available in this department. Please try again later or contact the hospital directly.");
    }

    return doctor;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  assignDoctor,
};
