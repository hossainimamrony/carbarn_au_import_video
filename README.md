# 🎬 Audio-Driven Video Automation Pipeline

This repository houses an enterprise-grade, fully automated video generation pipeline. It translates raw text prompts into fully rendered, highly dynamic videos with perfectly synchronized audio, visuals, and typography.

## 🏗 Core Philosophy: The Director & The Projector

This architecture enforces a strict separation of concerns using the **"Metadata-Driven Approach."**

1. **The Director (Node.js Backend):** Residing in the generator folders, the backend does all the heavy lifting. It writes the script, generates the voiceover, analyzes word-level timestamps, downloads images, and calculates exact frame mathematics.
2. **The Projector (Remotion Frontend):** Residing in `src/`, the frontend is a mathematically "dumb" renderer. It makes zero decisions about pacing or timing. It simply reads the `master-script.json` timeline arrays and mounts visual/audio React components exactly when instructed.

---

## 📂 The Complete Architecture Map

Below is the exact 1:1 representation of the pipeline's structure and the flow of data.

```text
IMPORT-VIDEO-AUTOMATION/
├── public/                      # Phase 3: The Data Reservoir (Handoff Zone)
│   ├── audio/                   # Generated TTS Voiceovers (.mp3)
│   ├── data/                    # JSON Contracts
│   │   ├── master-script.json   # The mathematically calculated timeline manifest
│   │   └── transcript.json      # Raw word-level timestamps (e.g., from Whisper AI)
│   ├── images/                  # Visual Assets
│   │   ├── generated/           # AI-generated foregrounds (Transparent PNGs)
│   │   ├── screen_capture/      # Automated web scrapes or UI recordings
│   │   └── static/              # Permanent branding assets (logos, icons)
│   └── sfx/                     # Sanitized Sound Effects (Pre-trimmed)
│       ├── cars/
│       ├── Movement/
│       ├── Pacing/
│       └── ScreenActions/
├── src/                         # Phase 4: The Projector (Remotion Frontend)
│   ├── AudioSync/               
│   │   └── useActiveWord.ts     # React hook tying current frame to transcript.json
│   ├── Components/backgrounds/  
│   │   └── AnimatedBackground.tsx # Dynamic, reusable background elements
│   ├── LayoutEngine/            # Mathematical flexbox/grid grids to prevent collisions
│   ├── SFXHandler/              # 1:1 React wrappers for every file in public/sfx/
│   │   ├── cars/
│   │   ├── Movement/
│   │   ├── Pacing/
│   │   └── ScreenActions/
│   ├── TEMPLATE/                # The Director's Chair: Assembles components into scenes
│   ├── index.css                # Global styling
│   ├── index.ts                 # React application entry point
│   └── Root.tsx                 # Remotion Composition Registry
├── VideoImageGenerator/         # Phase 2: The Visual Producer
│   └── generate-visuals.mjs     # Reads the script and fetches/generates needed images
└── VideoScriptGenerator/        # Phase 1: The AI Brains
    ├── art-director.mjs         # Calculates frames, builds the master-script.json
    ├── copywriter.mjs           # Generates raw narrative text
    ├── generate-audio.mjs       # Calls TTS API to create the voiceover
    └── generate-transcript.mjs  # Extracts word-level milliseconds from the voiceover

```

---

## ⚙️ Module Breakdown & Data Flow

### Phase 1: `VideoScriptGenerator/` (The Brains)

This sequence must run first. It creates the narrative and the mathematical boundaries of the video.

* **`copywriter.mjs`:** The narrative agent. Takes user intent and writes the engaging spoken script.
* **`generate-audio.mjs`:** The voice agent. Sends the script to a Text-to-Speech API and drops the final `.mp3` into `public/audio/`.
* **`generate-transcript.mjs`:** The timing agent. Analyzes the generated `.mp3` using an AI model (like Whisper) to generate `transcript.json`. This maps exactly which millisecond every single word starts and ends.
* **`art-director.mjs`:** The calculation engine. It takes the `transcript.json`, converts the milliseconds into Remotion frames based on the project's FPS, decides when images/SFX should appear, and writes the final `master-script.json`.

### Phase 2: `VideoImageGenerator/` (The Visual Producer)

* **`generate-visuals.mjs`:** Once the Art Director finishes the script, this execution script scans it for visual requirements. It pings image APIs, captures UI screenshots, and saves the assets into `public/images/generated/` and `public/images/screen_capture/` so Remotion has zero loading delays.

### Phase 3: `public/` (The Data Reservoir)

This is the neutral zone where the Node.js backend drops finished assets for the React frontend to consume instantly via Remotion's `staticFile()` API.

* *Crucial Rule:* All files in `public/sfx/` have been manually sanitized in an audio editor to start at millisecond 0. We do not use React to fix dirty audio assets.

### Phase 4: `src/` (The Rendering Engine)

Remotion boots up and strictly follows the JSON manifest.

* **`AudioSync/useActiveWord.ts`:** A specialized React hook. It reads `transcript.json`, calculates the current video frame, and returns the exact word being spoken right now. This is used for dynamic karaoke-style text highlighting.
* **`Components/` & `LayoutEngine/`:** Isolated visual blocks and spatial grids. They ensure that dynamically generated text and images never overlap or clip off-screen.
* **`SFXHandler/`:** This folder strictly mirrors the `public/sfx/` directory. It uses `@remotion/media` to play sounds. It accepts dynamic `trimAfter` props to cut off continuous sounds (like typing) or lets one-shot sounds (like a `bubble-pop.mp3`) finish naturally.
* **`TEMPLATE/` & `Root.tsx`:** The final composition wrappers that map over the flat arrays in `master-script.json` using `<Sequence>` tags to trigger visuals and audio at precise frames.

---

## 📜 The Master JSON Contract

To prevent the React frontend from doing heavy object parsing, `master-script.json` is broken into strict, machine-readable tracks.

```json
{
  "meta": {
    "fps": 30,
    "totalFrames": 450
  },
  "voiceover": "public/audio/s1_voiceover.mp3",
  "textTracks": [
    {
      "text": "Hello! How are you?",
      "startFrame": 0,
      "durationFrames": 90
    }
  ],
  "visualTracks": [
    {
      "src": "public/images/generated/happy_person.png",
      "startFrame": 25,
      "durationFrames": 65,
      "zIndex": 1,
      "layout": "background"
    }
  ],
  "sfxTracks": [
    {
      "sfxId": "keyboard_typing",
      "startFrame": 0,
      "trimAfterFrames": 24 
    },
    {
      "sfxId": "simple_whoosh",
      "startFrame": 25,
      "trimAfterFrames": null
    }
  ]
}

```

### SFX Trimming Logic (`trimAfterFrames`)

* **Integers (e.g., `24`):** Used for continuous sounds (like typing). The React `SFXHandler` will cut the audio dead at exactly 24 frames.
* **`null`:** Used for one-shot sounds (pops, whooshes). The React `SFXHandler` converts this to `undefined`, telling Remotion to let the sanitized audio file play completely to preserve its natural tail/echo.