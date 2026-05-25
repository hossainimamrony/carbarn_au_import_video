import React from 'react';
import { staticFile } from 'remotion';
import { Audio } from '@remotion/media';

interface Props { volume?: number; playbackRate?: number; }

export const SwingWhoosh: React.FC<Props> = ({ volume = 1, playbackRate = 1 }) => {
  return <Audio src={staticFile('sfx/Movement/swing-whoosh.mp3')} volume={volume} playbackRate={playbackRate} />;
};