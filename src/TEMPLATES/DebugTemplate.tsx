import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useActiveWord } from '../AudioSync/useActiveWord';

export const DebugTemplate: React.FC = () => {
  // 1. Pull all the raw data from your hook
  const { word, isSpeaking, rawToken } = useActiveWord();
  
  // 2. Calculate the exact time for the visual display
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = Math.round((frame / fps) * 1000);

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#111', // Dark mode for the debugger
      color: 'white', 
      fontFamily: 'monospace', // Monospace is best for reading changing numbers
      padding: '80px', 
      justifyContent: 'center' 
    }}>
      
      {/* Play your generated ElevenLabs audio */}
      <Audio src={staticFile('audio/voiceover.mp3')} />

      {/* --- HUD (Heads Up Display) --- */}
      <div style={{ fontSize: '50px', color: '#00FFCC', marginBottom: '10px' }}>
        Current Time: {currentMs} ms
      </div>
      <div style={{ fontSize: '30px', color: '#666', marginBottom: '80px' }}>
        Remotion Frame: {frame}
      </div>

      {/* --- TELEPROMPTER --- */}
      {isSpeaking && rawToken ? (
        <div style={{ borderLeft: '12px solid #00FFCC', paddingLeft: '40px' }}>
          <div style={{ fontSize: '30px', color: '#888', marginBottom: '10px' }}>ACTIVE WORD:</div>
          <h1 style={{ fontSize: '130px', margin: 0, color: '#FFF', textTransform: 'uppercase' }}>
            {word}
          </h1>
          <div style={{ fontSize: '40px', color: '#aaa', marginTop: '20px' }}>
            JSON Start: {rawToken.startMs}ms <br/>
            JSON End: &nbsp;&nbsp;{rawToken.endMs}ms
          </div>
        </div>
      ) : (
        <div style={{ borderLeft: '12px solid #333', paddingLeft: '40px' }}>
           <h1 style={{ fontSize: '100px', margin: 0, color: '#333' }}>[ SILENCE ]</h1>
        </div>
      )}

    </AbsoluteFill>
  );
};