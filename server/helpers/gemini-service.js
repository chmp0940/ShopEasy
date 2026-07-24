const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-flash-latest alias (always routes to active free-tier model)
const MODEL_NAME = "gemini-flash-latest";

// Simple in-memory cache to avoid redundant API calls
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Generate text — single attempt, no retries
 */
async function generateText(systemPrompt, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generateText error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}

/**
 * Chat — single attempt, no retries
 */
async function generateChat(systemPrompt, history, userMessage) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generateChat error:", error.message);
    throw new Error("AI service temporarily unavailable");
  }
}

/**
 * Image analysis — single attempt, no retries
 */
async function analyzeImage(imageBase64, mimeType, prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg",
        },
      },
    ]);

    return result.response.text();
  } catch (error) {
    console.error("Gemini analyzeImage error:", error.message);
    throw new Error("AI vision service temporarily unavailable");
  }
}

module.exports = {
  generateText,
  generateChat,
  analyzeImage,
  getCached,
  setCache,
};
