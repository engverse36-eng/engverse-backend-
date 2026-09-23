const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    application: 'EngVerse English Academy Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/ielts/evaluate-writing', async (req, res) => {
  try {
    const { taskType, topic, studentResponse } = req.body;

    if (!studentResponse || studentResponse.trim().length < 20) {
      return res.status(400).json({ error: 'Response bohot chhota hai.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY backend mein configured nahi hai.' });
    }

    const promptText = `You are a certified senior IELTS examiner for EngVerse English Academy.
Task: Evaluate the following IELTS ${taskType}.
Topic: ${topic}
Student Answer:
${studentResponse}

Provide detailed feedback strictly in JSON format with keys:
- taskResponse (Score and feedback)
- coherenceCohesion (Score and feedback)
- lexicalResource (Score and feedback)
- grammaticalRange (Score and feedback)
- overallBand (Estimated band between 0 to 9)
- suggestions (Array of 3 actionable tips)`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await apiResponse.json();
    return res.json(data);
  } catch (error) {
    console.error('Error during evaluation:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`EngVerse Backend is running on port ${PORT}`);
});
