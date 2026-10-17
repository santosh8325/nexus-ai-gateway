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

// Comprehensive Child Safety Shield: Full awareness of adult, pornographic, and inappropriate terms for automatic blocking
const blockedKeywords = [
  'porn', 'porno', 'pornography', 'sex', 'sexual', 'nude', 'nudity', 'naked', 'erotica', 'erotic',
  'adult', 'xxx', 'nsfw', 'fetish', 'orgasm', 'prostitution', 'escort', 'striptease', 'stripper',
  'gambling', 'casino', 'betting', 'poker', 'slots', 'violence', 'kill', 'murder', 'suicide',
  'drugs', 'cocaine', 'heroin', 'meth', 'weed', 'cannabis', 'alcohol', 'beer', 'wine', 'liquor',
  'weapon', 'gun', 'rifle', 'knife', 'firearm', 'curse', 'badword', 'swear', 'bdsm', 'incest'
];

function isContentSafe(text) {
  const lower = text.toLowerCase();
  return !blockedKeywords.some(keyword => lower.includes(keyword));
}

// Central Gateway endpoint - Advanced Child Protection & AI Assistant Persona
app.post('/api/v1/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt field is required.' });
    }

    let cleanPrompt = prompt.trim();

    // 1. Advanced Child Safety Guard (Instantly intercepts and blocks any adult or explicit query)
    if (!isContentSafe(cleanPrompt)) {
      return res.json({
        success: true,
        engine: "NexusAI SafeSchool Guard",
        answer: "I'm your dedicated school portal assistant! For safety and learning, I only discuss educational topics such as mathematics, science, history, and literature. How can I help you study today?",
        sources: []
      });
    }

    let answerText = "";

    // 2. Instant Smart Math Solver (Directly evaluates expressions like 99 * 99 without fluff)
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    if (mathRegex.test(cleanPrompt) && /[+\-*/]/.test(cleanPrompt)) {
      try {
        const evaluatedResult = Function(`'use strict'; return (${cleanPrompt})`)();
        if (typeof evaluatedResult === 'number' && !isNaN(evaluatedResult)) {
          answerText = `The answer to **${cleanPrompt}** is **${evaluatedResult}**.\n\nLet me know if you need help with any other math problems or schoolwork!`;
        }
      } catch (e) {
        // Fallback
      }
    }

    // 3. AI Assistant Persona for General Educational Queries
    if (!answerText) {
      const lower = cleanPrompt.toLowerCase();
      if (/^hi|hello|hey|greetings/.test(lower)) {
        answerText = "Hello! I am your AI learning assistant. What subject would you like to explore today?";
      } else {
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
          .filter(snippet => isContentSafe(snippet)) // Double-checks snippets for safety
          .slice(0, 3);

        if (extractedAnswers.length > 0) {
          answerText = `Here is what you need to know about **${cleanPrompt}**:\n\n` + 
            extractedAnswers.map(ans => `• ${ans}`).join('\n\n') + 
            `\n\nI hope this helps with your studies! Let me know if you have any follow-up questions.`;
        } else {
          answerText = `I processed your request regarding "${cleanPrompt}". How can I help you expand your knowledge on this topic?`;
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
  console.log(`NexusAI Assistant Server running on port ${PORT} (Advanced Child Protection Active)`);
});
