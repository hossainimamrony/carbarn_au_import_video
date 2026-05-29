import React from 'react';
import { FloatingImage } from './FloatingImage'; // We built this earlier!

interface AssetGridProps {
  // An array of filenames that should currently be on screen
  activeFilenames: string[]; 
}

export const AssetGrid: React.FC<AssetGridProps> = ({ activeFilenames }) => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px', // Spacing between multiple images
        width: '100%',
        height: '600px', // Give them a safe box to live in
        padding: '0 50px',
      }}
    >
      {activeFilenames.map((filename, index) => (
        <div 
          key={filename + index} 
          style={{ 
            flex: 1, // This makes them share space equally!
            display: 'flex', 
            justifyContent: 'center' 
          }}
        >
          {/* We reuse your bouncy, floating image component */}
          <FloatingImage filename={filename} />
        </div>
      ))}
    </div>
  );
};