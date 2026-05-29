import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {useActiveWord, TranscriptToken} from '../AudioSync/useActiveWord';
import {AssetGrid} from '../Components/AssetGrid';
import {PopText} from '../Components/PopText';
import {AnimatedBackground} from '../Components/backgrounds/AnimatedBackground';
import {SFXHandler} from '../SFXHandler';
import {getKeywordStartFrame} from './keywordTiming';

type VisualAsset = {
  keyword: string;
  filename: string;
};

type SceneSentence = {
  visual_assets?: VisualAsset[];
};

type SceneData = {
  scene_id: string;
  sentences: SceneSentence[];
};

type ThemeData = {
  primary_color?: string;
};

interface SceneTemplateProps {
  scene: SceneData;
  transcript: TranscriptToken[];
  theme: ThemeData;
}

export const SceneTemplate: React.FC<SceneTemplateProps> = ({
  scene,
  transcript,
  theme,
}) => {
  const {word} = useActiveWord(transcript);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const imageSchedule = useMemo(() => {
    if (!transcript || transcript.length === 0) {
      return [];
    }

    const schedule: {filename: string; startFrame: number}[] = [];

    for (const sentence of scene.sentences) {
      if (!sentence.visual_assets) {
        continue;
      }

      for (const asset of sentence.visual_assets) {
        const startFrame = getKeywordStartFrame(asset.keyword, transcript, fps);

        if (startFrame !== null) {
          schedule.push({
            filename: asset.filename,
            startFrame,
          });
        }
      }
    }

    return schedule.sort((a, b) => a.startFrame - b.startFrame);
  }, [scene, transcript, fps]);

  const activeImages = useMemo(() => {
    return imageSchedule
      .filter((img) => img.startFrame <= frame)
      .map((img) => img.filename)
      .slice(-3);
  }, [frame, imageSchedule]);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AnimatedBackground />

      <Audio
        src={staticFile(`audio/voiceover/${scene.scene_id}.mp3`)}
        pauseWhenBuffering={false}
      />

      <SFXHandler scene={scene} transcript={transcript} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          paddingBottom: '150px',
        }}
      >
        <AssetGrid activeFilenames={activeImages} />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PopText text={word} color={theme?.primary_color || '#111'} />
      </div>
    </AbsoluteFill>
  );
};
