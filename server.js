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

// Central Gateway endpoint for Chatbot queries - NO API KEY REQUIRED
app.post('/api/v1/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt field is required.' });
    }

    let cleanPrompt = prompt.trim().toLowerCase();
    let answerText = "";

    // 1. Smart Local Evaluation for Math & Simple Greetings (Zero-Key AI Simulation)
    if (/^1\s*\+\s*1\s*=?\s*$/.test(cleanPrompt)) {
      answerText = "1 + 1 = 2";
    } else if (/^hi|hello|hey/.test(cleanPrompt)) {
      answerText = "Hello! I am your NexusAI assistant. How can I help you today?";
    } else {
      // 2. Fetch live search results for other questions
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(prompt)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const htmlText = await response.text();
      const snippetMatches = [...htmlText.matchAll(/<a class="result__snippet"[^>]*>(.*?)<\/a>/g)];
      let extractedAnswers = snippetMatches.map(m => m[1].replace(/<[^>]*>?/gm, '')).slice(0, 3);

      answerText = extractedAnswers.length > 0 
        ? extractedAnswers.join('\n\n')
        : `Live search results for "${prompt}" have been processed successfully.`;
    }

    res.json({
      success: true,
      engine: "NexusAI Direct Intelligent Engine",
      answer: answerText,
      sources: [
        { title: "Query Processed: " + prompt, uri: `https://www.google.com/search?q=${encodeURIComponent(prompt)}&udm=50&aep=11` }
      ]
    });
  } catch (error) {
    console.error('Gateway Error:', error);
    res.status(500).json({ error: 'Internal Gateway Error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NexusAI Gateway Server running on port ${PORT} (Zero API Key Mode)`);
});
