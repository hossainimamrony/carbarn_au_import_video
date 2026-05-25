import React from 'react';
import { staticFile } from 'remotion';
import { Audio } from '@remotion/media';

interface Props { volume?: number; playbackRate?: number; }

export const Ping: React.FC<Props> = ({ volume = 1, playbackRate = 1 }) => {
  return <Audio src={staticFile('sfx/ScreenActions/ping.mp3')} volume={volume} playbackRate={playbackRate} />;
};