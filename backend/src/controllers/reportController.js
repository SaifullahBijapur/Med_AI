const fs = require("fs");
const ai = require("../config/gemini");
const { toolImplementations } = require("../agent/tools");
const Report = require("../models/Report");

const uploadReport = async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const hospitalId = req.hospitalId;
    const { patientId, appointmentId, reportType } = req.body;

    // Upload file to Gemini
    const uploaded = await ai.files.upload({
      file: req.file.path,
      config: {
        mimeType: req.file.mimetype,
      },
    });

    console.log("UPLOADED FILE:", JSON.stringify(uploaded, null, 2));

    const fileUri = uploaded?.uri || uploaded?.file?.uri;
    const mimeType = uploaded?.mimeType || uploaded?.file?.mimeType || req.file.mimetype;

    if (!fileUri) {
      throw new Error("Gemini upload succeeded but no file URI was returned.");
    }

    // Analyze with AI
    const result = await toolImplementations.analyze_medical_report({
      fileUri,
      mimeType,
    });

    // Save report to database
    const report = await Report.create({
      hospitalId,
      patientId: patientId || null,
      appointmentId: appointmentId || null,
      reportType: reportType || "Other",
      reportUrl: fileUri,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      aiSummary: result.analysis?.summary || "",
      aiConfidence: result.analysis?.confidence || 0,
      uploadedBy: req.userId,
    });

    // Cleanup local temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.log("Temp file cleanup skipped");
    }

    return res.status(200).json({
      success: true,
      analysis: result.analysis,
      report,
    });
  } catch (error) {
    console.error("REPORT ANALYSIS ERROR:", error);

    // Cleanup on error
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// List reports for a hospital
const listReports = async (req, res) => {
  try {
    const { patientId, reportType, page = 1, limit = 20 } = req.query;
    const hospitalId = req.hospitalId;

    const query = { hospitalId };
    if (patientId) query.patientId = patientId;
    if (reportType) query.reportType = reportType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .populate("patientId", "fullName patientCode")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadReport,
  listReports,
};
