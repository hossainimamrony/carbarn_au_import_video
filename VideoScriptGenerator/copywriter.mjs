import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is missing from your .env file!');
  process.exit(1);
}

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 2. Define the hand-off file for the Art Director
const OUTPUT_JSON_PATH = path.resolve('public/data/raw-script.json');
const DATA_DIR = path.resolve('public/data');

// 3. The Prompt (You can change this anytime to make a new video)
const VIDEO_TOPIC = "A fast-paced, 3-scene YouTube Short about importing premium JDM cars from Japan to Australia using Carbarn AU. Make it punchy and engaging.";

async function generateScript() {
  console.log(`✍️ Copywriter Agent is writing the script for: "${VIDEO_TOPIC}"...`);

  try {
    // We use the flash model because it is lightning fast and great at JSON
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // CRITICAL: Forces perfect JSON output
      }
    });

    const prompt = `
      You are an expert short-form video copywriter. 
      Write a highly engaging script based on this topic: ${VIDEO_TOPIC}.
      
      You must output valid JSON matching this exact schema:
      {
        "scenes": [
          {
            "scene_id": "scene_1",
            "text": "The spoken words for the first scene."
          }
        ]
      }
      
      Rules:
      - Keep sentences short and punchy.
      - Ensure the flow sounds natural when spoken aloud.
      - Do NOT include any visual directions or camera angles in the "text", ONLY the words the voiceover will speak.
    `;

    const result = await model.generateContent(prompt);
    const rawJsonText = result.response.text();
    
    // Parse the output just to verify it's valid JSON before saving
    const scriptData = JSON.parse(rawJsonText);

    // Save the raw script
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(scriptData, null, 2));

    console.log(`✅ Copywriter finished! Wrote ${scriptData.scenes.length} scenes to ${OUTPUT_JSON_PATH}`);

  } catch (error) {
    console.error('❌ Copywriter failed:', error);
  }
}

generateScript();