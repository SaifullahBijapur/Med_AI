const express = require("express");
const router = express.Router();
const { verifyToken, enforceHospitalScope } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiter");
const { chatWithAgent } = require("../controllers/agentController");

router.post("/chat", verifyToken, aiLimiter, enforceHospitalScope, chatWithAgent);

module.exports = router;
