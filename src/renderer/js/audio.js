'use strict';

// Plays a vocab entry's audio clip if one exists. Voice-acting is recorded later;
// until then entries have `audio: null` (or the file is missing) and play() resolves
// false so the UI can show a friendly "audio binnenkort" fallback instead of breaking.

const AUDIO_DIR = '../../assets/audio/';
const cache = new Map();

export function hasAudio(entry) {
  return Boolean(entry && entry.audio);
}

export function play(entry) {
  return new Promise((resolve) => {
    if (!hasAudio(entry)) return resolve(false);

    let a = cache.get(entry.audio);
    if (!a) {
      a = new Audio(AUDIO_DIR + entry.audio);
      cache.set(entry.audio, a);
    }
    a.currentTime = 0;

    const onErr = () => {
      cleanup();
      resolve(false); // file declared but missing/unsupported — fall back gracefully
    };
    const onEnd = () => {
      cleanup();
      resolve(true);
    };
    const cleanup = () => {
      a.removeEventListener('error', onErr);
      a.removeEventListener('ended', onEnd);
    };
    a.addEventListener('error', onErr, { once: true });
    a.addEventListener('ended', onEnd, { once: true });

    a.play().then(() => resolve(true)).catch(onErr);
  });
}
