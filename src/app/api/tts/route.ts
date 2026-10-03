import { NextRequest, NextResponse } from 'next/server';

// ElevenLabs curated voices
const VOICES = {
  apprentice: '21m00Tcm4TlvDq8ikWAM', // Rachel - bright, observant, curious apprentice
  sabine: 'Xb7hH8MSUJpSbSDYk0k2',     // Alice - calm, mature, experienced 24-year controller
};

export async function POST(req: NextRequest) {
  try {
    const { text, persona = 'apprentice', voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const selectedVoiceId = voiceId || (persona === 'sabine' ? VOICES.sabine : VOICES.apprentice);
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { fallback: true, persona, message: 'ELEVENLABS_API_KEY not configured. Falling back to browser speech.' },
        { status: 200 }
      );
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Native English + German fluency
        voice_settings: {
          stability: persona === 'sabine' ? 0.65 : 0.45,
          similarity_boost: 0.85,
          style: persona === 'sabine' ? 0.2 : 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('ElevenLabs API notice:', errorText);
      return NextResponse.json(
        { fallback: true, persona, error: errorText },
        { status: 200 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('TTS handler error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed', fallback: true }, { status: 500 });
  }
}
