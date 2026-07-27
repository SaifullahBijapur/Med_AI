const express = require("express");
const multer = require("multer");
const router = express.Router();
const { verifyToken, requireRole, enforceHospitalScope } = require("../middleware/auth");
const { logAction } = require("../middleware/auditLog");
const { uploadReport, listReports } = require("../controllers/reportController");

const upload = multer({ dest: "uploads/" });

router.post("/upload-report", verifyToken, enforceHospitalScope, upload.single("report"), logAction("CREATE", "Report"), uploadReport);
router.get("/", verifyToken, enforceHospitalScope, logAction("READ", "Report"), listReports);

module.exports = router;
