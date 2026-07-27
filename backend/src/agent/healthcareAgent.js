const ai = require("../config/gemini");
const { functionDeclarations, toolImplementations } = require("./tools");

const MODEL = "gemini-3.1-flash-lite";
const MAX_TURNS = 6;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Call the model with retry/backoff on transient rate-limit (429) errors.
const generateWithRetry = async (params) => {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = err?.status || err?.code;
      const is429 =
        status === 429 ||
        /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(err?.message || "");
      if (!is429 || attempt === MAX_RETRIES) throw err;
      lastError = err;
      await sleep(2000 * Math.pow(2, attempt));
    }
  }
  throw lastError;
};

const SYSTEM_INSTRUCTION = `You are MediHive, the AI operations assistant for a multi-tenant hospital management system.
You help hospital staff with patient triage, appointment booking, doctor availability, bed management, and analytics.

Guidelines:
- For READ-ONLY questions (doctor availability, appointments, patients, analytics, triage), call the relevant tool IMMEDIATELY and answer. Never ask the user for permission to look something up.
- Base every factual claim about doctors, appointments, patients, or analytics on tool results, not assumptions.
- For triage and clinical questions, be conservative: when symptoms could be serious, escalate.
- Booking is the ONLY action that needs confirmation. To BOOK an appointment you need the patient's full name, phone number, and symptoms. If any are missing, ask for them.
- When you book, summarize the outcome clearly: assigned doctor, department, severity, queue number, and estimated wait time.
- Be concise and professional. Use short paragraphs or bullet points.
- You are not a substitute for a licensed clinician's judgment; flag emergencies clearly.
- If a medical report, prescription, discharge summary, scan, X-ray, PDF, or image is provided, call analyze_medical_report immediately.
- Extract abnormalities, diagnoses, medications, risk factors, and recommendations.
- Present findings in a structured clinical format.`;

// Convert the chat history into Gemini "contents".
const toContents = (messages = []) =>
  messages
    .filter((m) => m && (m.content || m.text))
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.content ?? m.text) }],
    }));

const runAgent = async (messages, hospitalId, userRole) => {
  const contents = toContents(messages);

  if (contents.length === 0) {
    throw new Error("At least one user message is required.");
  }

  // Customize system instruction based on user role
  let roleContext = "";
  if (userRole === "superadmin") {
    roleContext = " You have super admin privileges and can access data across all hospitals.";
  } else if (userRole === "hospital_admin") {
    roleContext = " You are assisting a hospital administrator with operational oversight.";
  } else if (userRole === "doctor") {
    roleContext = " You are assisting a doctor with patient care and clinical decisions.";
  } else if (userRole === "receptionist") {
    roleContext = " You are assisting a receptionist with patient registration and appointment scheduling.";
  }

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION + roleContext,
    temperature: 0.2,
    tools: [{ functionDeclarations }],
    thinkingConfig: { thinkingBudget: 0 },
  };

  const toolsUsed = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await generateWithRetry({
      model: MODEL,
      contents,
      config,
    });

    const calls = response.functionCalls;

    if (!calls || calls.length === 0) {
      const reply =
        response.text ||
        "I couldn't produce a response for that. Could you rephrase or try again?";
      return { reply, toolsUsed };
    }

    const modelContent = response.candidates?.[0]?.content;
    contents.push(
      modelContent || {
        role: "model",
        parts: calls.map((fc) => ({ functionCall: fc })),
      }
    );

    const responseParts = [];
    for (const fc of calls) {
      toolsUsed.push(fc.name);
      const impl = toolImplementations[hospitalId];

      let result;
      try {
        if (!impl) throw new Error(`Unknown tool: ${fc.name}`);
        // Pass hospitalId to all tool implementations
        result = await impl[fc.name](fc.args || {}, hospitalId);
      } catch (err) {
        result = { error: err.message || String(err) };
      }

      responseParts.push({
        functionResponse: {
          name: fc.name,
          response: { result },
        },
      });
    }

    contents.push({ role: "user", parts: responseParts });
  }

  return {
    reply:
      "I wasn't able to complete that within the allowed number of steps. Could you narrow the request or try again?",
    toolsUsed,
  };
};

module.exports = { runAgent };
