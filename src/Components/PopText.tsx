import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface PopTextProps {
  text: string | null; // 1. Tell TypeScript it is okay to receive null
  color?: string;
  fontSize?: string;
}

export const PopText: React.FC<PopTextProps> = ({ 
  text, 
  color = '#111', 
  fontSize = '120px' 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 2. Early Return: If there is no text, don't try to render or animate anything
  if (!text) {
    return null;
  }

  const scale = spring({
    fps,
    frame,
    config: {
      damping: 12,      
      stiffness: 200,   
    },
  });

  return (
    <h1 
      style={{ 
        transform: `scale(${scale})`, 
        color, 
        fontSize,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        margin: 0,
        textAlign: 'center',
        textShadow: '0px 10px 20px rgba(0,0,0,0.05)'
      }}
    >
      {text}
    </h1>
  );
};