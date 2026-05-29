import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useMemo } from 'react';

// Define the shape of our new ElevenLabs transcript tokens
export interface TranscriptToken {
  id: string;      // e.g., "scene_1_w4" - THIS IS OUR ANCHOR
  text: string;    // e.g., "Toyota"
  startMs: number; // e.g., 1500
  endMs: number;   // e.g., 1800
}

// The hook now accepts scene transcript data and falls back to an empty track.
export const useActiveWord = (transcriptData: TranscriptToken[] = []) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const activeToken = useMemo(() => {
    // Safety check: if no data was passed, return nothing
    if (!transcriptData || transcriptData.length === 0) return undefined;

    return transcriptData.find(
      (token) => currentMs >= token.startMs && currentMs <= token.endMs
    );
  }, [currentMs, transcriptData]);

  const cleanWord = activeToken 
    ? activeToken.text.toLowerCase().replace(/[^a-z0-9]/g, '') 
    : null;

  return {
    id: activeToken ? activeToken.id : null, // Expose the exact unique ID!
    word: cleanWord,              
    isSpeaking: !!activeToken,    
    currentMs: currentMs,         // Exposing this helps the Scene Template
    rawToken: activeToken || null 
  };
};
