const express = require("express");
const router = express.Router();
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const Bed = require("../models/Bed");

// List beds
router.get("/", verifyToken, enforceHospitalScope, async (req, res) => {
  try {
    const { wardName, status, department } = req.query;
    const query = { hospitalId: req.hospitalId, isActive: true };
    if (wardName) query.wardName = wardName;
    if (status) query.status = status;
    if (department) query.department = department;

    const beds = await Bed.find(query)
      .populate("occupiedBy", "fullName patientCode")
      .sort({ wardName: 1, roomNumber: 1, bedNumber: 1 });

    res.json({ success: true, beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create bed
router.post("/", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("CREATE", "Bed"), async (req, res) => {
  try {
    const { wardName, roomNumber, bedNumber, bedType, department, dailyRate, facilities } = req.body;
    const hospitalId = req.hospitalId;

    const Hospital = require("../models/Hospital");
    const hospital = await Hospital.findById(hospitalId);
    const prefix = hospital ? hospital.slug.substring(0, 3).toUpperCase() : "HOS";
    const count = await Bed.countDocuments({ hospitalId });
    const bedCode = `${prefix}-B${String(count + 1).padStart(4, "0")}`;

    const bed = await Bed.create({
      hospitalId,
      bedCode,
      wardName,
      roomNumber,
      bedNumber,
      bedType: bedType || "General",
      department,
      dailyRate: dailyRate || 0,
      facilities: facilities || [],
    });

    res.status(201).json({ success: true, bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update bed status
router.patch("/:id/status", verifyToken, requireRole("hospital_admin", "receptionist", "doctor"), enforceHospitalScope, logAction("UPDATE", "Bed"), async (req, res) => {
  try {
    const { status, occupiedBy, expectedDischarge } = req.body;
    const updateData = { status };

    if (status === "occupied") {
      updateData.occupiedBy = occupiedBy;
      updateData.occupiedSince = new Date();
      if (expectedDischarge) updateData.expectedDischarge = new Date(expectedDischarge);
    } else {
      updateData.occupiedBy = null;
      updateData.occupiedSince = null;
      updateData.expectedDischarge = null;
    }

    const bed = await Bed.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { $set: updateData },
      { new: true }
    ).populate("occupiedBy", "fullName patientCode");

    if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });
    res.json({ success: true, bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete bed
router.delete("/:id", verifyToken, requireRole("hospital_admin"), enforceHospitalScope, logAction("DELETE", "Bed"), async (req, res) => {
  try {
    const bed = await Bed.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { isActive: false },
      { new: true }
    );
    if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });
    res.json({ success: true, message: "Bed removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
