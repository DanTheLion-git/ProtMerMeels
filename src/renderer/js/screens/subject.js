'use strict';

// Subject screen: a Duolingo-style winding path from the first lesson to the last,
// plus the subject's top-5 leaderboard alongside.

import { el, clear } from '../util.js';
import { leaderboardEl } from '../leaderboard.js';

const ASSET_IMG = '../../assets/img/';
const WAVE = [0, 1, 0, -1]; // gentle left–right snake, repeats every 4 nodes
const AMP = 120;            // px horizontal swing

export function renderSubject(root, ctx, params) {
  clear(root);
  const unit = (ctx.course.units || []).find((u) => u.id === params.unitId);
  if (!unit) return ctx.navigate('home');

  const back = el('button', {
    class: 'icon-btn',
    'aria-label': 'Terug',
    onclick: () => ctx.navigate('home')
  }, '←');

  const heading = el('div', { class: 'subject-head' }, [
    back,
    unit.image
      ? el('img', { class: 'subject-head__img', src: ASSET_IMG + unit.image, alt: '', onerror: function () { this.remove(); } })
      : null,
    el('h1', { class: 'subject-head__title' }, unit.title)
  ]);

  const path = el('div', { class: 'lesson-path' },
    (unit.lessons || []).map((lesson, i) => {
      const done = ctx.session.completed.has(lesson.id);
      const off = WAVE[i % WAVE.length] * AMP;
      return el('button', {
        class: 'path-node' + (done ? ' is-done' : ''),
        style: '--off:' + off + 'px',
        onclick: () => ctx.navigate('lesson', { unitId: unit.id, lessonId: lesson.id })
      }, [
        el('span', { class: 'path-node__circle' }, done ? '✓' : String(i + 1)),
        el('span', { class: 'path-node__label' }, lesson.title)
      ]);
    }));

  const board = el('aside', { class: 'subject-aside' }, [leaderboardEl(unit.id, '')]);

  const body = el('div', { class: 'subject-body' }, [
    el('div', { class: 'lesson-path-wrap' }, [path]),
    board
  ]);
  root.appendChild(el('div', { class: 'screen subject' }, [heading, body]));
}
