const { runAgent } = require("../agent/healthcareAgent");

const chatWithAgent = async (req, res) => {
  try {
    let { messages, message } = req.body;
    const hospitalId = req.hospitalId;
    const userRole = req.userRole;

    // Accept either a full { messages: [...] } history or a single { message }
    if (!messages && message) {
      messages = [{ role: "user", content: message }];
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide either 'messages' array or a single 'message'.",
      });
    }

    const response = await runAgent(messages, hospitalId, userRole);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Agent chat error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Agent processing failed.",
    });
  }
};

module.exports = {
  chatWithAgent,
};
