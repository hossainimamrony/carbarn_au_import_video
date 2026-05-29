import React, {useMemo} from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {TranscriptToken} from '../AudioSync/useActiveWord';
import {getKeywordStartFrame} from '../TEMPLATES/keywordTiming';

type SfxDefinition = {
  src: string;
  durationInFrames: number;
  volume?: number;
};

export const SFXMap: Record<string, SfxDefinition> = {
  'open-car-door': {
    src: 'sfx/cars/open-car-door.mp3',
    durationInFrames: 45,
  },
  'glitch-transition': {
    src: 'sfx/Movement/glitch-fx-transitions.mp3',
    durationInFrames: 45,
  },
  'simple-whoosh': {
    src: 'sfx/Movement/simple-whoosh.mp3',
    durationInFrames: 45,
  },
  'swing-whoosh': {
    src: 'sfx/Movement/swing-whoosh.mp3',
    durationInFrames: 45,
  },
  swoosh: {
    src: 'sfx/Movement/swoosh.mp3',
    durationInFrames: 45,
  },
  'whoosh-end': {
    src: 'sfx/Movement/whoosh-end.mp3',
    durationInFrames: 45,
  },
  error: {
    src: 'sfx/Pacing/error.mp3',
    durationInFrames: 45,
  },
  'record-scratch': {
    src: 'sfx/Pacing/record_scratch.mp3',
    durationInFrames: 90,
  },
  riser: {
    src: 'sfx/Pacing/riser.mp3',
    durationInFrames: 120,
  },
  'bubble-pop': {
    src: 'sfx/ScreenActions/bubble-pop.mp3',
    durationInFrames: 30,
  },
  'chutter-click': {
    src: 'sfx/ScreenActions/chutter-click.mp3',
    durationInFrames: 30,
  },
  'keyboard-typing': {
    src: 'sfx/ScreenActions/keyboard-typing-sound-effect.mp3',
    durationInFrames: 90,
    volume: 0.8,
  },
  'mouse-click': {
    src: 'sfx/ScreenActions/mouse-click.mp3',
    durationInFrames: 30,
  },
  ping: {
    src: 'sfx/ScreenActions/ping.mp3',
    durationInFrames: 30,
  },
};

type SfxType = keyof typeof SFXMap;

const SOUND_CYCLE: SfxType[] = ['swoosh', 'bubble-pop', 'ping', 'simple-whoosh'];

type VisualAsset = {
  keyword: string;
};

type SceneSentence = {
  visual_assets?: VisualAsset[];
};

type SceneData = {
  sentences?: SceneSentence[];
};

interface SFXHandlerProps {
  scene: SceneData;
  transcript: TranscriptToken[];
}

export const SFXHandler: React.FC<SFXHandlerProps> = ({scene, transcript}) => {
  const {fps} = useVideoConfig();

  const sfxEvents = useMemo(() => {
    const events: {frame: number; type: SfxType}[] = [];
    const usedFrames = new Set<number>();
    let soundIndex = 0;

    if (!scene.sentences) {
      return events;
    }

    for (const sentence of scene.sentences) {
      if (!sentence.visual_assets) {
        continue;
      }

      for (const asset of sentence.visual_assets) {
        const startFrame = getKeywordStartFrame(asset.keyword, transcript, fps);

        if (startFrame === null || usedFrames.has(startFrame)) {
          continue;
        }

        usedFrames.add(startFrame);

        events.push({
          frame: startFrame,
          type: SOUND_CYCLE[soundIndex % SOUND_CYCLE.length],
        });

        soundIndex++;
      }
    }

    return events;
  }, [scene, transcript, fps]);

  return (
    <>
      {sfxEvents.map((event, index) => {
        const sound = SFXMap[event.type];

        return (
          <Sequence
            key={`sfx-${event.type}-${event.frame}-${index}`}
            from={event.frame}
            durationInFrames={sound.durationInFrames}
            layout="none"
            showInTimeline={false}
          >
            <Audio
              src={staticFile(sound.src)}
              volume={() => sound.volume ?? 0.6}
              pauseWhenBuffering={false}
              acceptableTimeShiftInSeconds={0.45}
              showInTimeline={false}
            />
          </Sequence>
        );
      })}
    </>
  );
};
