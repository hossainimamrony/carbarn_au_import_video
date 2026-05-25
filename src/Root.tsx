// src/Root.tsx
import { Composition } from 'remotion';

// Import your components based on your folder structure
import { SplitRevealTemplate } from './templates/SplitRevealTemplate';
import { AnimatedBackground } from './Components/backgrounds/AnimatedBackground';


export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Preview for your Split Reveal */}
      <Composition
        id="SplitRevealPreview"
        component={SplitRevealTemplate}
        durationInFrames={120} // Long enough to see the animation finish
        fps={30}
        width={1920}
        height={1080}
        // Providing temporary placeholder images to test the split
        defaultProps={{
          subjectName: "Test Subject",
          highlightWord: "GENIUS",
          subjectImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop", 
          coreImage: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop" 
        }}
      />

      {/* 2. Preview for your Animated Background */}
      <Composition
        id="AnimatedBgPreview"
        component={AnimatedBackground}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />





    </>
  );
};