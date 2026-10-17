const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const validApiKeys = new Set(['nexus_live_demo123']);

const authenticateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid API Key format.' });
  }
  const key = authHeader.split(' ')[1];
  if (!validApiKeys.has(key) && !key.startsWith('nexus_live_')) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key.' });
  }
  next();
};

app.post('/api/v1/generate', authenticateApiKey, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt field is required.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }]
    });

    res.json({
      success: true,
      engine: "NexusAI Pro Core",
      answer: response.text,
      sources: response.groundingMetadata?.groundingAttributions?.map(attr => ({
        title: attr.web?.title,
        uri: attr.web?.uri
      })) || []
    });
  } catch (error) {
    console.error('Gateway Error:', error);
    res.status(500).json({ error: 'Internal Gateway Error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NexusAI Gateway Server running on port ${PORT}`);
});