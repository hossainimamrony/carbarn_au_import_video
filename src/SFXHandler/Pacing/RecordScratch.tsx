import React from 'react';
import { staticFile } from 'remotion';
import { Audio } from '@remotion/media';

interface Props { volume?: number; playbackRate?: number; }

export const RecordScratch: React.FC<Props> = ({ volume = 1, playbackRate = 1 }) => {
  return <Audio src={staticFile('sfx/Pacing/record_scratch.mp3')} volume={volume} playbackRate={playbackRate} />;
};