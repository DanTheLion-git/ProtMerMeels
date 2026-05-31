'use strict';

// Show a word in one language, tap the correct translation among four.
// direction 'nl2meels' = show Dutch, pick Mééls. 'meels2nl' = the reverse.

import { el } from '../util.js';
import { speakerButton, promptHeader } from './_shared.js';

export function mountMultipleChoice(stage, item, api) {
  const showMeelsPrompt = item.direction === 'meels2nl';
  const promptText = showMeelsPrompt ? item.prompt.meels : item.prompt.nl;
  const optionText = (e) => (showMeelsPrompt ? e.nl : e.meels);
  const label = showMeelsPrompt ? 'Wat betekent dit in het Nederlands?' : 'Kies het juiste Mééls';

  const wordNodes = [el('span', {}, promptText)];
  if (showMeelsPrompt) wordNodes.push(speakerButton(item.prompt, { big: true }));

  const grid = el('div', { class: 'options' });
  const buttons = item.options.map((opt) => {
    const b = el('button', {
      class: 'option',
      onclick: () => choose(opt, b)
    }, optionText(opt));
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

  stage.appendChild(promptHeader(label, wordNodes));
  stage.appendChild(grid);
}
