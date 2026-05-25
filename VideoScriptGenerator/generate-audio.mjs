import fs from 'fs';
import path from 'path';

// 1. Define your custom AWS Lambda endpoint and the text
const TTS_URL = 'https://s5mzy5cumnqxzpz5ubgazwfivu0yaebi.lambda-url.eu-north-1.on.aws/v1/audio/speech';
const SCRIPT_TEXT = "Hello! My name is William, and this automated video pipeline is working perfectly on AWS.";

// 2. Define exactly where the audio should be saved for Remotion to use it
const OUTPUT_PATH = path.resolve('public/audio/voiceover.mp3');

async function generateAudio() {
  console.log('🎙️ Requesting audio from custom Edge TTS API...');

  try {
    const response = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header needed for your public Lambda URL!
      },
      body: JSON.stringify({
        text: SCRIPT_TEXT,
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

    // 3. Convert the response directly to a buffer and save it
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure the output directory exists
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    
    // Save the file
    fs.writeFileSync(OUTPUT_PATH, buffer);

    console.log(`✅ Audio successfully saved to: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Failed to generate audio:', error);
  }
}

generateAudio();