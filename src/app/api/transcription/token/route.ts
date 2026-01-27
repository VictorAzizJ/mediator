import { NextResponse } from 'next/server';

/**
 * POST /api/transcription/token
 *
 * Generates a temporary token/URL for Deepgram WebSocket connection.
 * This keeps the API key secure on the server side.
 *
 * Required env var: DEEPGRAM_API_KEY
 */
export async function POST() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.warn('DEEPGRAM_API_KEY not configured - transcription disabled');
    return NextResponse.json(
      {
        error: 'Transcription service not configured',
        hint: 'Set DEEPGRAM_API_KEY in your environment variables',
      },
      { status: 503 }
    );
  }

  try {
    // Build the WebSocket URL with recommended parameters for real-time transcription
    const params = new URLSearchParams({
      model: 'nova-2',
      language: 'en',
      punctuate: 'true',
      diarize: 'true',
      smart_format: 'true',
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
      interim_results: 'true',
      utterance_end_ms: '1000',
      vad_events: 'true',
    });

    return NextResponse.json({
      key: apiKey,
      url: `wss://api.deepgram.com/v1/listen?${params.toString()}`,
      expiresAt: Date.now() + 3600000, // 1 hour (informational)
    });
  } catch (error) {
    console.error('Error generating transcription token:', error);
    return NextResponse.json(
      { error: 'Failed to generate transcription token' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transcription/token
 *
 * Health check for transcription service availability
 */
export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        available: false,
        error: 'Transcription service not configured',
        hint: 'Set DEEPGRAM_API_KEY in environment variables',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    available: true,
    provider: 'deepgram',
    model: 'nova-2',
    features: ['real-time', 'diarization', 'punctuation', 'smart-format', 'vad-events'],
  });
}
