import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';

interface FloatingImageProps {
  filename: string;
}

export const FloatingImage: React.FC<FloatingImageProps> = ({ filename }) => {
  const frame = useCurrentFrame();

  // Uses a sine wave to calculate a smooth up-and-down floating motion
  // Divides by 15 to slow it down, multiplies by 20 to set the distance in pixels
  const yOffset = Math.sin(frame / 15) * 20;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Img
        // Automatically targets your generated images folder
        src={staticFile(`images/generated/${filename}`)}
        style={{
          transform: `translateY(${yOffset}px)`,
          maxWidth: '80%', 
          maxHeight: '80%',
          objectFit: 'contain',
          // A premium drop shadow makes transparent PNGs look 3D and integrated
          filter: 'drop-shadow(0px 30px 40px rgba(0,0,0,0.15))' 
        }}
      />
    </div>
  );
};