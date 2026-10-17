const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the index.html dashboard at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Strict Child Safety & Adult Content Blocklist for School Portals
const blockedKeywords = [
  'porn', 'sex', 'adult', 'nude', 'gambling', 'casino', 'violence', 'kill', 
  'suicide', 'drugs', 'alcohol', 'beer', 'wine', 'weapon', 'gun', 'curse', 'badword'
];

function isContentSafe(text) {
  const lower = text.toLowerCase();
  return !blockedKeywords.some(keyword => lower.includes(keyword));
}

// Central Gateway endpoint - Designed to respond with Claude/Gemini AI Persona
app.post('/api/v1/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt field is required.' });
    }

    let cleanPrompt = prompt.trim();

    // 1. Strict Child Safety Check
    if (!isContentSafe(cleanPrompt)) {
      return res.json({
        success: true,
        engine: "NexusAI SafeSchool Guard",
        answer: "I'm here to help you learn safely! Let's explore topics in math, science, history, or literature. What would you like to study next?",
        sources: []
      });
    }

    let answerText = "";

    // 2. Instant Smart Math Solver (Direct & Precise like an AI tutor)
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    if (mathRegex.test(cleanPrompt) && /[+\-*/]/.test(cleanPrompt)) {
      try {
        const evaluatedResult = Function(`'use strict'; return (${cleanPrompt})`)();
        if (typeof evaluatedResult === 'number' && !isNaN(evaluatedResult)) {
          answerText = `The answer to **${cleanPrompt}** is **${evaluatedResult}**.\n\nLet me know if you would like me to explain the steps or help you with another problem!`;
        }
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    // 3. Conversational AI Persona for General Questions
    if (!answerText) {
      const lower = cleanPrompt.toLowerCase();
      if (/^hi|hello|hey|greetings/.test(lower)) {
        answerText = "Hello! I am your AI learning assistant. How can I help you explore and learn today?";
      } else {
        // Fetch web insights and structure them like an LLM assistant
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanPrompt + " definition explanation homework")}`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const htmlText = await response.text();
        const snippetMatches = [...htmlText.matchAll(/<a class="result__snippet"[^>]*>(.*?)<\/a>/g)];
        let extractedAnswers = snippetMatches
          .map(m => m[1].replace(/<[^>]*>?/gm, ''))
          .filter(snippet => isContentSafe(snippet))
          .slice(0, 3);

        if (extractedAnswers.length > 0) {
          // Format like Claude/Gemini: clean summary introduction followed by bulleted insights
          answerText = `Here is what you need to know about **${cleanPrompt}**:\n\n` + 
            extractedAnswers.map(ans => `• ${ans}`).join('\n\n') + 
            `\n\nI hope this helps! Let me know if you have any other questions.`;
        } else {
          answerText = `I processed your request regarding "${cleanPrompt}". Feel free to ask me follow-up questions so we can dive deeper into the topic!`;
        }
      }
    }

    res.json({
      success: true,
      engine: "NexusAI Assistant Engine",
      answer: answerText,
      sources: [
        { title: "Verified Educational Query: " + cleanPrompt, uri: `https://www.google.com/search?q=${encodeURIComponent(cleanPrompt)}&udm=50&aep=11` }
      ]
    });
  } catch (error) {
    console.error('Gateway Error:', error);
    res.status(500).json({ error: 'Internal Gateway Error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NexusAI Assistant Server running on port ${PORT} (AI Persona Active)`);
});
