const { analyzeSymptoms } = require("../services/triageAgent");

const triagePatient = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const hospitalId = req.hospitalId;

    const result = await analyzeSymptoms(symptoms, hospitalId);

    res.json({
      success: true,
      triage: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  triagePatient,
};
