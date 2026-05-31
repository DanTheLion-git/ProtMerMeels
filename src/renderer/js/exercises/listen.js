'use strict';

// Hear a Mééls word, tap which one it was. Until voice-acting exists the audio
// is missing, so we reveal the target word as text and the exercise still works
// as a recognition task.

import { el } from '../util.js';
import * as audio from '../audio.js';

export function mountListen(stage, item, api) {
  const hasAudio = audio.hasAudio(item.answer);

  const bigSpeaker = el('button', {
    class: 'speaker speaker--xl',
    'aria-label': 'Beluister',
    onclick: () => audio.play(item.answer)
  }, '🔊');

  const header = el('div', { class: 'listen-head' }, [bigSpeaker]);

  if (hasAudio) {
    audio.play(item.answer); // auto-play once on mount
  } else {
    header.appendChild(
      el('div', { class: 'listen-fallback' }, [
        el('span', { class: 'listen-fallback__tag' }, '🔇 Audio binnenkort'),
        el('span', { class: 'listen-fallback__word' }, item.answer.meels)
      ])
    );
  }

  const grid = el('div', { class: 'options' });
  const buttons = item.options.map((opt) => {
    const b = el('button', {
      class: 'option',
      onclick: () => choose(opt, b)
    }, opt.meels);
    grid.appendChild(b);
    return b;
  });

  function choose(opt, btn) {
    if (btn.disabled) return;
    if (opt.id === item.answer.id) {
      btn.classList.add('is-correct');
      buttons.forEach((b) => (b.disabled = true));
      api.solved();
    } else {
      btn.classList.add('is-wrong');
      btn.disabled = true;
      api.wrong();
    }
  }

  stage.appendChild(el('p', { class: 'prompt__label center' }, 'Welk woord hoor je?'));
  stage.appendChild(header);
  stage.appendChild(grid);
}
