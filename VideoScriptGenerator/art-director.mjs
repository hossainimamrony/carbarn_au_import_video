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

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const RAW_SCRIPT_PATH = path.resolve('public/data/raw-script.json');
const MASTER_SCRIPT_PATH = path.resolve('public/data/master-script.json');

// Helper function to pause execution and avoid API rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function directVisuals() {
  console.log('🎨 Art Director is analyzing the script scene by scene...');

  try {
    // 1. Read the raw script
    if (!fs.existsSync(RAW_SCRIPT_PATH)) {
      throw new Error(`Cannot find ${RAW_SCRIPT_PATH}. Run the copywriter first!`);
    }
    const rawData = fs.readFileSync(RAW_SCRIPT_PATH, 'utf-8');
    const rawScript = JSON.parse(rawData);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // 2. Initialize the Master Script structure
    const masterScriptData = {
      theme: {},
      scenes: []
    };

    // 3. Loop through one scene at a time
    for (let i = 0; i < rawScript.scenes.length; i++) {
      const scene = rawScript.scenes[i];
      console.log(`🎬 Processing Scene: ${scene.scene_id} (${i + 1}/${rawScript.scenes.length})...`);

      // Dynamic instructions for the theme (only ask on the first loop)
      const themeInstruction = i === 0 
        ? `6. Since this is the first scene, please also generate a global "theme" object for the whole video.` 
        : ``;
      
      const themeSchema = i === 0 
        ? `"theme": { "background_style": "grid | pulse | solid | noise", "primary_color": "Hex color code" },` 
        : ``;

      const prompt = `
        You are an expert Art Director for a short-form video automation pipeline.
        I will provide you with the text for ONE SINGLE SCENE from a video script.
        
        Your job is to break the scene's text down SENTENCE BY SENTENCE, and inject "visual_assets" for each sentence.
        
        RULES FOR VISUAL ASSETS:
        1. Break the provided scene text into individual sentences.
        2. For EACH sentence, pick 1 to 3 important keywords to represent the subjects visually.
        3. The "keyword" must be exactly how it appears in the text, lowercase, no punctuation.
        4. Write a highly detailed "prompt" for an AI image generator based on that keyword. To ensure the generated image can be easily made transparent, explicitly include instructions like "isolated on a solid white background" or "die-cut style" in your prompt.
        5. ALL visual assets must float over the background. You MUST ALWAYS set "needs_transparency" to true for every single asset. Do not set it to false under any circumstances.
        ${themeInstruction}

        EXPECTED OUTPUT SCHEMA:
        {
          ${themeSchema}
          "scene_id": "${scene.scene_id}",
          "sentences": [
            {
              "text": "The exact first sentence of the scene goes here.",
              "visual_assets": [
                {
                  "keyword": "car",
                  "filename": "${scene.scene_id}_asset_1.png",
                  "prompt": "A cinematic, hyper-realistic shot of a JDM car, isolated on a solid white background, centered...",
                  "needs_transparency": true
                },
                {
                  "keyword": "engine",
                  "filename": "${scene.scene_id}_asset_2.png",
                  "prompt": "A highly detailed 3D render of a car engine, isolated on a solid white background, die-cut style...",
                  "needs_transparency": true
                }
              ]
            }
          ]
        }

        SCENE TEXT TO PROCESS:
        ${scene.text}
      `;

      // Generate content for this specific scene
      const result = await model.generateContent(prompt);
      const processedData = JSON.parse(result.response.text());

      // If it's the first loop, extract and save the global theme
      if (i === 0 && processedData.theme) {
        masterScriptData.theme = processedData.theme;
      }

      // Remove the theme object from the scene data so it doesn't clutter the scenes array
      delete processedData.theme;
      
      // Add the processed scene to our master array
      masterScriptData.scenes.push(processedData);

      // Pause for 1.5 seconds to avoid API rate limits
      await delay(1500); 
    }

    // 4. Save the final compiled Master Script
    fs.writeFileSync(MASTER_SCRIPT_PATH, JSON.stringify(masterScriptData, null, 2));
    console.log(`✅ Art Director finished! Master script saved to ${MASTER_SCRIPT_PATH}`);

  } catch (error) {
    console.error('❌ Art Director failed:', error);
  }
}

directVisuals();