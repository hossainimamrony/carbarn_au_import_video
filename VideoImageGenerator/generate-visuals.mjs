import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize Environment Variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is missing from your .env file!');
  process.exit(1);
}

// 2. Initialize the official Gemini SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MASTER_SCRIPT_PATH = path.resolve('public/data/master-script.json');
const IMAGES_DIR = path.resolve('public/images/generated');

// Ensure the output directory exists
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Enterprise Utility: Pause execution to respect API rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enterprise Wrapper: Generates the image using the official Google SDK.
 * Includes a retry mechanism in case of rate limits.
 */
async function generateTransparentImage(prompt, attempt = 1) {
  const MAX_RETRIES = 3;
  
  console.log(`   [API CALL] Generating asset: "${prompt}" (Attempt ${attempt})...`);

  try {
    // Call the specific 3.1 Flash Image Preview model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-image-preview"
    });

    // Send the prompt directly through the SDK
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Safety check: Did Google block the prompt for safety reasons?
    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Generation blocked by safety filters or returned empty.");
    }

    let base64Image = null;
    
    // The SDK returns the image data nested inside the response parts
    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("No image data returned from API.");
    }

    // Convert the Base64 string directly into a raw Node Buffer for Sharp to crop
    return Buffer.from(base64Image, 'base64');

  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.warn(`   ⚠️ Generation failed. Retrying in ${attempt * 2} seconds...`);
      await delay(attempt * 2000); // Exponential backoff: 2s, 4s, 6s
      return generateTransparentImage(prompt, attempt + 1);
    } else {
      throw new Error(`Failed after ${MAX_RETRIES} attempts. Last error: ${error.message}`);
    }
  }
}

async function runVisualPipeline() {
  console.log('🖼️ Starting Production Visual Asset Pipeline...');

  if (!fs.existsSync(MASTER_SCRIPT_PATH)) {
    console.error(`❌ ERROR: Cannot find ${MASTER_SCRIPT_PATH}. Run the Art Director first!`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(MASTER_SCRIPT_PATH, 'utf-8');
  const masterScript = JSON.parse(rawData);

  let totalGenerated = 0;

  for (const scene of masterScript.scenes) {
    if (!scene.sentences || scene.sentences.length === 0) continue;
    
    console.log(`\n🎬 Scanning ${scene.scene_id} for visual assets...`);

    for (let i = 0; i < scene.sentences.length; i++) {
      const sentence = scene.sentences[i];
      
      if (!sentence.visual_assets || sentence.visual_assets.length === 0) continue;

      for (const asset of sentence.visual_assets) {
        const fileName = asset.filename; 
        const filePath = path.join(IMAGES_DIR, fileName);

        // Cache Check: Do not waste API credits if already generated!
        if (fs.existsSync(filePath)) {
          console.log(`   ⏭️ Skipping ${fileName} - already exists in cache.`);
          continue;
        }

        try {
          // Fetch the raw image buffer from the SDK
          const rawImageBuffer = await generateTransparentImage(asset.prompt);

          // Use Sharp to tightly crop the image and save it
          await sharp(rawImageBuffer)
            .trim() 
            .toFile(filePath);

          const metadata = await sharp(filePath).metadata();
          console.log(`   ✅ Saved tight-cropped ${fileName} (${metadata.width}x${metadata.height}px)`);
          
          totalGenerated++;

          // Pause to prevent hitting the Gemini API too fast
          await delay(3000);

        } catch (error) {
          console.error(`   ❌ CRITICAL FAILURE on ${fileName}:`, error.message);
        }
      }
    }
  }
  
  console.log(`\n🎉 Visual Pipeline complete! Successfully generated ${totalGenerated} new assets.`);
}

runVisualPipeline();