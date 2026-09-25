import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser for JSON (audio chunks base64) up to 25MB
app.use(express.json({ limit: '25mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Speech-to-Text Proxy API endpoint using Gemini 3.5 Transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType, languageCode, languageName, promptHint } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData in request' });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please ensure the API key is provided.'
      });
    }

    const cleanMimeType = (mimeType || 'audio/webm').split(';')[0];
    const base64Data = audioData.replace(/^data:[^;]+;base64,/, '');

    const targetLang = languageName || 'the spoken language';
    const systemPrompt = `You are a high-precision, multi-lingual audio transcription engine.
Transcribe exactly what is spoken in the audio without adding commentary, conversational replies, quotes, or conversational filler of your own.
The speaker may have diverse accents (including Indian, British, Australian, Spanish, Asian, or non-native English accents, or speak in ${targetLang}).
Accurately capture all words, including numbers and technical terms.
If there is only background noise, ambient silence, or no intelligible speech, respond with an empty string: ""
Output format: Return ONLY the exact transcribed text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: base64Data,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      },
    });

    const transcribedText = (response.text || '').trim();

    return res.json({
      text: transcribedText,
      success: true,
    });
  } catch (error: any) {
    console.error('Error during audio transcription:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to transcribe audio',
      success: false,
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Mount Vite middleware in development
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TranscribeLive server running on http://0.0.0.0:${PORT}`);
});
