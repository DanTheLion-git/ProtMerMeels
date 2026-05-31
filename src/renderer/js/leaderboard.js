'use strict';

// Shared TOP-5 leaderboard widget, used on the subject screen and the
// completion screen.

import { el } from './util.js';
import { getTop } from './highscore.js';

export function leaderboardEl(unitId, title, { highlightIndex = -1 } = {}) {
  const rows = getTop(unitId);
  const body = el('ol', { class: 'leaderboard__list' });

  if (rows.length === 0) {
    body.appendChild(el('li', { class: 'leaderboard__empty' }, 'Nog geen topscores — speel een les!'));
  } else {
    rows.forEach((r, i) => {
      body.appendChild(
        el('li', { class: 'leaderboard__row' + (i === highlightIndex ? ' is-new' : '') }, [
          el('span', { class: 'leaderboard__rank' }, String(i + 1)),
          el('span', { class: 'leaderboard__name' }, r.name),
          el('span', { class: 'leaderboard__score' }, String(r.score))
        ])
      );
    });
  }

  return el('div', { class: 'leaderboard' }, [
    el('div', { class: 'leaderboard__title' }, [
      el('span', { class: 'leaderboard__cup' }, '🏆'),
      el('span', {}, (title ? title + ' — ' : '') + 'Top 5')
    ]),
    body
  ]);
}
