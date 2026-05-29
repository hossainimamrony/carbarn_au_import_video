import React from 'react';
import {Composition} from 'remotion';
import {DebugTemplate} from './TEMPLATES/DebugTemplate';
import {
  MASTER_VIDEO_FPS,
  MasterSequence,
  getMasterSequenceDurationInFrames,
} from './TEMPLATES/MasterSequence';
import './index.css';

export const RemotionRoot: React.FC = () => {
  const masterVideoDurationInFrames = getMasterSequenceDurationInFrames(
    MASTER_VIDEO_FPS,
  );

  return (
    <>
      <Composition
        id="MasterVideo"
        component={MasterSequence}
        durationInFrames={masterVideoDurationInFrames}
        fps={MASTER_VIDEO_FPS}
        width={1920}
        height={1080}
      />

      <Composition
        id="VisualDebugger"
        component={DebugTemplate}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
