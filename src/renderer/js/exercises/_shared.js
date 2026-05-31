'use strict';

// Bits shared by several exercise types: the speaker button and a transient toast.

import { el } from '../util.js';
import * as audio from '../audio.js';

export function speakerButton(entry, { big = false } = {}) {
  const btn = el('button', {
    class: 'speaker' + (big ? ' speaker--big' : ''),
    'aria-label': 'Beluister',
    onclick: async () => {
      btn.classList.add('is-playing');
      const ok = await audio.play(entry);
      btn.classList.remove('is-playing');
      if (!ok) showToast('🔇 Audio binnenkort');
    }
  }, '🔊');
  return btn;
}

let toastTimer = null;
export function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = el('div', { class: 'toast' });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-shown'), 1600);
}

// Standard prompt header used at the top of several exercises.
export function promptHeader(label, wordNode) {
  return el('div', { class: 'prompt' }, [
    el('p', { class: 'prompt__label' }, label),
    el('div', { class: 'prompt__word' }, wordNode)
  ]);
}
