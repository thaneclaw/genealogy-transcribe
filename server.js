const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const VENICE_API_KEY = process.env.VENICE_API_KEY;

if (!VENICE_API_KEY) {
  console.error('ERROR: VENICE_API_KEY not set');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/transcribe', async (req, res) => {
  const start = Date.now();
  const { image, prompt } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Missing image field (base64 string)' });
  }

  const base64Image = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const defaultPrompt = prompt ||
    'Transcribe this historical document. Extract: date, names, locations, occupations, relationships, and any other genealogical information. Return a structured transcription with field labels.';

  try {
    const response = await axios.post(
      'https://api.venice.ai/api/v1/chat/completions',
      {
        model: 'qwen-2.5-vl',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: defaultPrompt },
              {
                type: 'image_url',
                image_url: { url: 'data:image/jpeg;base64,' + base64Image }
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': 'Bearer ' + VENICE_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );

    const transcription = response.data.choices && response.data.choices[0] && response.data.choices[0].message
      ? response.data.choices[0].message.content
      : '';
    const duration = Date.now() - start;

    res.json({
      success: true,
      transcription,
      duration_ms: duration,
      model: 'qwen-2.5-vl'
    });
  } catch (err) {
    console.error('Transcription error:', err.message);
    const status = err.response && err.response.status ? err.response.status : 500;
    const detail = err.response && err.response.data && err.response.data.error && err.response.data.error.message
      ? err.response.data.error.message
      : err.message;
    res.status(status).json({
      success: false,
      error: detail,
      duration_ms: Date.now() - start
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('Genealogy transcribe service running on port ' + PORT);
});
