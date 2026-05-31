'use strict';

// Tap a Dutch tile then its Mééls match (or vice-versa) to clear the pair.
// Lesson is solved when every pair is matched.

import { el, shuffle } from '../util.js';

export function mountMatchPairs(stage, item, api) {
  const entries = item.entries;
  let selected = null;
  let remaining = entries.length;

  const makeTile = (entry, side, text) =>
    el('button', {
      class: 'tile',
      dataset: { id: entry.id, side },
      onclick: function () { tap(this); }
    }, text);

  const leftCol = el('div', { class: 'match-col' },
    shuffle(entries).map((e) => makeTile(e, 'nl', e.nl)));
  const rightCol = el('div', { class: 'match-col' },
    shuffle(entries).map((e) => makeTile(e, 'meels', e.meels)));

  function tap(tile) {
    if (tile.classList.contains('is-matched') || tile.classList.contains('is-selected')) {
      tile.classList.remove('is-selected');
      selected = null;
      return;
    }
    if (!selected) {
      selected = tile;
      tile.classList.add('is-selected');
      return;
    }
    // second tile chosen
    const samePair = selected.dataset.id === tile.dataset.id && selected.dataset.side !== tile.dataset.side;
    if (samePair) {
      [selected, tile].forEach((t) => {
        t.classList.remove('is-selected');
        t.classList.add('is-matched');
        t.disabled = true;
      });
      selected = null;
      remaining--;
      if (remaining === 0) api.solved();
    } else {
      const a = selected;
      a.classList.add('is-wrong');
      tile.classList.add('is-wrong');
      setTimeout(() => { a.classList.remove('is-wrong', 'is-selected'); tile.classList.remove('is-wrong'); }, 450);
      selected = null;
      api.wrong();
    }
  }

  stage.appendChild(el('p', { class: 'prompt__label center' }, 'Tik de juiste paren aan'));
  stage.appendChild(el('div', { class: 'match' }, [leftCol, rightCol]));
}
