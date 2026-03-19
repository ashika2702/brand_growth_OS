export async function generateVoice(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM') {
  if (!process.env.ELEVENLABS_API_KEY) {
    // Return null so the frontend can use a fallback
    return null;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  } catch (error) {
    console.error('ElevenLabs Error:', error);
    return null;
  }
}
