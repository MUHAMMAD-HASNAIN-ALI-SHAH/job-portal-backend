require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getEmbedding(text) {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });
  return result.embeddings[0].values;
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

function calculateATSMatch(resumeEmbedding, jobEmbedding) {
  const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);

  // Convert similarity to a percentage score
  const score = similarity * 100;

  return Math.min(100, Math.round(score));
}

module.exports = { getEmbedding, calculateATSMatch };
