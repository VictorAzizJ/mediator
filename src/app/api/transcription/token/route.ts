import { NextResponse } from 'next/server';

// This endpoint provides the Deepgram API key to authenticated clients
// In production, this should verify user authentication before returning the key

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Transcription service not configured' },
      { status: 503 }
    );
  }

  // In production, add authentication check here
  // const session = await getServerSession();
  // if (!session) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  return NextResponse.json({ apiKey });
}
