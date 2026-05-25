import React from 'react';
import { staticFile } from 'remotion';
import { Audio } from '@remotion/media';

// Note: I included trimAfter here because typing sounds often need to be cut short when text stops generating
interface Props { volume?: number; playbackRate?: number; trimAfter?: number; }

export const KeyboardTypingSoundEffect: React.FC<Props> = ({ volume = 0.8, playbackRate = 1, trimAfter }) => {
  return <Audio src={staticFile('sfx/ScreenActions/keyboard-typing-sound-effect.mp3')} volume={volume} playbackRate={playbackRate} trimAfter={trimAfter} />;
};