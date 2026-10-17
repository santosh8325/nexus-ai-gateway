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

// Strict Child Safety & Adult Content Blocklist
const blockedKeywords = [
  'porn', 'sex', 'adult', 'nude', 'gambling', 'casino', 'violence', 'kill', 
  'suicide', 'drugs', 'alcohol', 'beer', 'wine', 'weapon', 'gun', 'curse', 'badword'
];

function isContentSafe(text) {
  const lower = text.toLowerCase();
  return !blockedKeywords.some(keyword => lower.includes(keyword));
}

// Central Gateway endpoint for Chatbot queries - Child Safe & Zero API Key
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
        answer: "I'm your safe school portal assistant! Let's focus on learning topics like math, science, history, and geography. How can I help you with your studies today?",
        sources: []
      });
    }

    let answerText = "";

    // 2. Instant Math Evaluator (Handles 99 * 99, 50+50, etc., directly without fluff)
    // Checks if prompt consists only of numbers and math operators (+, -, *, /, (, ), spaces)
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    if (mathRegex.test(cleanPrompt) && /[+\-*/]/.test(cleanPrompt)) {
      try {
        // Safe evaluation for basic arithmetic
        const evaluatedResult = Function(`'use strict'; return (${cleanPrompt})`)();
        if (typeof evaluatedResult === 'number' && !isNaN(evaluatedResult)) {
          answerText = `${cleanPrompt} = ${evaluatedResult}`;
        }
      } catch (e) {
        // Fallback if math evaluation fails
      }
    }

    // 3. General Greetings & Study Support
    if (!answerText) {
      const lower = cleanPrompt.toLowerCase();
      if (/^hi|hello|hey|greetings/.test(lower)) {
        answerText = "Hello! I am your safe school assistant. Ask me any math, science, or educational question!";
      } else {
        // 4. Fetch live educational/search results securely via DuckDuckGo
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
          .filter(snippet => isContentSafe(snippet)) // Safety filter on snippets
          .slice(0, 3);

        answerText = extractedAnswers.length > 0 
          ? extractedAnswers.join('\n\n')
          : `Here is the information regarding "${cleanPrompt}": Processed securely for your school portal session.`;
      }
    }

    res.json({
      success: true,
      engine: "NexusAI SafeSchool Engine",
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
  console.log(`NexusAI SafeSchool Gateway running on port ${PORT} (Child Mode Active)`);
});
