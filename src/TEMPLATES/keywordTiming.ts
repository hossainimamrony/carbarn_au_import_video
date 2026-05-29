import type {TranscriptToken} from '../AudioSync/useActiveWord';

const normalizeToken = (value: string) => {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const findKeywordStartMs = (
  keyword: string,
  transcript: TranscriptToken[],
) => {
  const normalizedKeyword = normalizeToken(keyword);

  if (!normalizedKeyword || transcript.length === 0) {
    return null;
  }

  for (let startIndex = 0; startIndex < transcript.length; startIndex++) {
    let combined = '';

    for (let endIndex = startIndex; endIndex < transcript.length; endIndex++) {
      combined += normalizeToken(transcript[endIndex].text);

      if (combined === normalizedKeyword) {
        return transcript[startIndex].startMs;
      }

      if (!normalizedKeyword.startsWith(combined)) {
        break;
      }
    }
  }

  return null;
};

export const getKeywordStartFrame = (
  keyword: string,
  transcript: TranscriptToken[],
  fps: number,
) => {
  const startMs = findKeywordStartMs(keyword, transcript);

  if (startMs === null) {
    return null;
  }

  return Math.round((startMs / 1000) * fps);
};
