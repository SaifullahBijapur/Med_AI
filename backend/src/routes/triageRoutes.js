const express = require("express");
const router = express.Router();
const { verifyToken, enforceHospitalScope } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiter");
const { triagePatient } = require("../controllers/triageController");

router.post("/", verifyToken, aiLimiter, enforceHospitalScope, triagePatient);

module.exports = router;
