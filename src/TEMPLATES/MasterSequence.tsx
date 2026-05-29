import React from 'react';
import {Series, useVideoConfig} from 'remotion';
import {TranscriptToken} from '../AudioSync/useActiveWord';
import {SceneTemplate} from './SceneTemplate';

import masterScript from '../../public/data/master-script.json';
import transcript1 from '../../public/data/transcript_scene_1.json';
import transcript2 from '../../public/data/transcript_scene_2.json';
import transcript3 from '../../public/data/transcript_scene_3.json';

type MasterScene = {
  scene_id: string;
  sentences: {
    visual_assets?: {
      keyword: string;
      filename: string;
    }[];
  }[];
};

type MasterScriptData = {
  theme: {
    primary_color?: string;
  };
  scenes: MasterScene[];
};

const typedMasterScript = masterScript as MasterScriptData;

const transcriptMap: Record<string, TranscriptToken[]> = {
  scene_1: transcript1,
  scene_2: transcript2,
  scene_3: transcript3,
};

export const MASTER_VIDEO_FPS = 30;

export const getSceneDurationInFrames = (
  transcript: TranscriptToken[],
  fps: number,
) => {
  if (!transcript || transcript.length === 0) {
    return 0;
  }

  const lastWord = transcript[transcript.length - 1];
  const sceneDurationMs = lastWord.endMs + 800;

  return Math.max(1, Math.round((sceneDurationMs / 1000) * fps));
};

export const getMasterSequenceDurationInFrames = (fps: number) => {
  return typedMasterScript.scenes.reduce((total, scene) => {
    const transcript = transcriptMap[scene.scene_id] ?? [];
    return total + getSceneDurationInFrames(transcript, fps);
  }, 0);
};

export const MasterSequence: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <Series>
      {typedMasterScript.scenes.map((scene) => {
        const transcript = transcriptMap[scene.scene_id];

        if (!transcript || transcript.length === 0) {
          return null;
        }

        return (
          <Series.Sequence
            key={scene.scene_id}
            durationInFrames={getSceneDurationInFrames(transcript, fps)}
          >
            <SceneTemplate
              scene={scene}
              transcript={transcript}
              theme={typedMasterScript.theme}
            />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
