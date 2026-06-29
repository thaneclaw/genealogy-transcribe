# Genealogy Transcribe Service

Minimal Node.js/Express backend for genealogy document transcription using Venice AI vision models.

## API

### POST /api/transcribe

Request:
```json
{
  "image": "base64_encoded_image_string",
  "prompt": "optional custom prompt"
}
```

Response:
```json
{
  "success": true,
  "transcription": "...",
  "duration_ms": 25000,
  "model": "qwen-2.5-vl"
}
```

### GET /health

Health check endpoint.

## Environment Variables

- `VENICE_API_KEY` — required. Venice AI API key.
- `PORT` — optional, defaults to 3000.

## Deploy

1. Push to GitHub
2. Connect repo to Render
3. Set `VENICE_API_KEY` in environment variables
4. Deploy as Web Service (Free tier)
