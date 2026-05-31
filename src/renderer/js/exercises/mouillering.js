'use strict';

// The signature-feature exercise: given a Dutch word with ei/ij/ui, tap the
// correctly mouillered Mééls form (husj, not huis; géétj, not geit).

import { el } from '../util.js';

export function mountMouillering(stage, item, api) {
  const grid = el('div', { class: 'options options--wide' });
  const buttons = item.options.map((opt) => {
    const b = el('button', {
      class: 'option option--meels',
      onclick: () => choose(opt, b)
    }, opt);
    grid.appendChild(b);
    return b;
  });

  function choose(opt, btn) {
    if (btn.disabled) return;
    if (opt === item.answer) {
      btn.classList.add('is-correct');
      buttons.forEach((b) => (b.disabled = true));
      api.solved();
    } else {
      btn.classList.add('is-wrong');
      btn.disabled = true;
      api.wrong();
    }
  }

  stage.appendChild(
    el('div', { class: 'prompt' }, [
      el('p', { class: 'prompt__label' }, 'Hoe schrijf je dit in het Mééls?'),
      el('div', { class: 'prompt__word' }, item.prompt.nl)
    ])
  );
  stage.appendChild(el('p', { class: 'mouillering-hint' }, 'Let op de Méélse mouillering — de -j na ei / ij / ui'));
  stage.appendChild(grid);
}
