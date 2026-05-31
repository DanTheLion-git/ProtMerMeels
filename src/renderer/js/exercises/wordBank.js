'use strict';

// Build a short Mééls phrase by tapping word tiles into the answer row.
// Auto-checks once the row is full; a wrong attempt returns the tiles to the bank.

import { el, clear, shuffle } from '../util.js';

export function mountWordBank(stage, item, api) {
  const answer = item.answer;
  const slots = el('div', { class: 'wb-slots' });
  const bank = el('div', { class: 'wb-bank' });
  let placed = [];

  function makeTile(word, where) {
    return el('button', { class: 'wb-tile', onclick: () => move(word, where) }, word);
  }

  function render() {
    clear(slots);
    clear(bank);
    placed.forEach((w) => slots.appendChild(makeTile(w, 'slot')));
    remainingTokens().forEach((w) => bank.appendChild(makeTile(w, 'bank')));
  }

  function remainingTokens() {
    const used = placed.slice();
    return item.tokens.filter((tok) => {
      const i = used.indexOf(tok);
      if (i >= 0) { used.splice(i, 1); return false; }
      return true;
    });
  }

  function move(word, where) {
    if (where === 'bank') placed.push(word);
    else placed.splice(placed.lastIndexOf(word), 1);
    render();
    if (placed.length === answer.length) check();
  }

  function check() {
    if (placed.join(' ') === answer.join(' ')) {
      slots.classList.add('is-correct');
      [...slots.children, ...bank.children].forEach((b) => (b.disabled = true));
      api.solved();
    } else {
      slots.classList.add('is-wrong');
      api.wrong();
      setTimeout(() => { slots.classList.remove('is-wrong'); placed = []; render(); }, 600);
    }
  }

  stage.appendChild(
    el('div', { class: 'prompt' }, [
      el('p', { class: 'prompt__label' }, 'Vertaal naar het Mééls'),
      el('div', { class: 'prompt__word' }, item.prompt.nl)
    ])
  );
  stage.appendChild(slots);
  stage.appendChild(el('div', { class: 'wb-bank-wrap' }, [bank]));
  render();
}
