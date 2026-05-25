import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Update the texture every 6 frames to create a classic "stop-motion" feel.
  // Assuming a 30fps video, this creates 5 new paper textures per second.
  const stopMotionFrame = Math.floor(frame / 6);

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F5F0' }}>
      {/* We define the 3D paper filter but hide the SVG container itself */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="crumpled-paper">
          {/* 1. Generates the randomized "creases" */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="5"
            result="noise"
            // Changing the seed completely redraws the crumples
            seed={stopMotionFrame}
          />
          
          {/* 2. Creates the 3D lighting and shadow effect over the creases */}
          <feDiffuseLighting
            in="noise"
            lightingColor="#ffffff"
            surfaceScale="2"
            result="light"
          >
            {/* Controls where the light hits the paper (angle and height) */}
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          
          {/* 3. Blends the shadows with the background color of the div below */}
          <feBlend mode="multiply" in="SourceGraphic" in2="light" />
        </filter>
      </svg>

      {/* This visible layer applies the filter to fill the screen */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F3F0E6', // A warm, natural off-white paper color
          filter: 'url(#crumpled-paper)',
        }}
      />
    </AbsoluteFill>
  );
};