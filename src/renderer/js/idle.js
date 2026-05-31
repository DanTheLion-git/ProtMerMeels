'use strict';

// Returns the table to the attract/home screen after a period of no interaction,
// so the next museum visitor always starts fresh.

let timer = null;
let timeoutMs = 75000;
let onIdle = () => {};
let enabled = false;

function reset() {
  if (!enabled) return;
  clearTimeout(timer);
  timer = setTimeout(() => onIdle(), timeoutMs);
}

export function initIdle(ms, callback) {
  timeoutMs = ms;
  onIdle = callback;
  enabled = true;
  ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel'].forEach((ev) =>
    window.addEventListener(ev, reset, { passive: true })
  );
  reset();
}

// Pause the watcher (e.g. while already on the home/attract screen).
export function pauseIdle() {
  enabled = false;
  clearTimeout(timer);
}

export function resumeIdle() {
  enabled = true;
  reset();
}
