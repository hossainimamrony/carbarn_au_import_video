import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

if (!ELEVENLABS_API_KEY) {
  console.error('❌ ERROR: ELEVENLABS_API_KEY is missing from your .env file!');
  process.exit(1);
}

// 1. Read the structured Master Script
const MASTER_SCRIPT_PATH = path.resolve('public/data/master-script.json');
const AUDIO_DIR = path.resolve('public/audio/voiceover');
const DATA_DIR = path.resolve('public/data');

// Ensure directories exist
fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

async function processScene(scene) {
  console.log(`🎙️ Processing ${scene.scene_id}...`);

  try {
    // THE FIX: Stitch all the individual sentences back together into one paragraph!
    const fullSceneText = scene.sentences.map(sentence => sentence.text).join(' ');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: fullSceneText, // Send the stitched paragraph instead of undefined
        model_id: 'eleven_multilingual_v2',
      })
    });

    // Upgraded Error Logging to see exactly what ElevenLabs is complaining about
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // 2. Save the Audio Block
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    fs.writeFileSync(path.join(AUDIO_DIR, `${scene.scene_id}.mp3`), audioBuffer);

    // 3. Process Character Timings into Word Timings
    const chars = data.alignment.characters;
    const starts = data.alignment.character_start_times_seconds;
    const ends = data.alignment.character_end_times_seconds;

    const transcript = [];
    let currentWord = "";
    let wordStartMs = null;
    let wordEndMs = null;
    let wordIndex = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (char !== " " && char !== "") {
        if (currentWord === "") wordStartMs = starts[i] * 1000;
        currentWord += char;
        wordEndMs = ends[i] * 1000;
      } else {
        if (currentWord.length > 0) {
          transcript.push({
            id: `${scene.scene_id}_w${wordIndex}`,
            text: currentWord,
            startMs: Math.round(wordStartMs),
            endMs: Math.round(wordEndMs)
          });
          currentWord = "";
          wordIndex++;
        }
      }
    }
    
    if (currentWord.length > 0) {
       transcript.push({ id: `${scene.scene_id}_w${wordIndex}`, text: currentWord, startMs: Math.round(wordStartMs), endMs: Math.round(wordEndMs) });
    }

    // 4. Save the Scene Transcript
    fs.writeFileSync(path.join(DATA_DIR, `transcript_${scene.scene_id}.json`), JSON.stringify(transcript, null, 2));
    console.log(`✅ Saved ${scene.scene_id} audio and transcript.`);

  } catch (error) {
    console.error(`❌ Failed on ${scene.scene_id}:`, error.message);
  }
}

async function runPipeline() {
  const rawData = fs.readFileSync(MASTER_SCRIPT_PATH, 'utf-8');
  const masterScript = JSON.parse(rawData);

  console.log(`🚀 Starting generation for ${masterScript.scenes.length} scenes...`);

  for (const scene of masterScript.scenes) {
    await processScene(scene);
  }
  
  console.log('🎉 Pipeline complete!');
}

runPipeline();