'use strict';

// Subject screen: the lessons of one subject + its top-5 leaderboard.
// Reached by tapping a panel on the home grid.

import { el, clear } from '../util.js';
import { leaderboardEl } from '../leaderboard.js';

const ASSET_IMG = '../../assets/img/';

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

  const lessons = el('div', { class: 'lesson-list' },
    (unit.lessons || []).map((lesson, i) => {
      const done = ctx.session.completed.has(lesson.id);
      return el('button', {
        class: 'lesson-card' + (done ? ' is-done' : ''),
        onclick: () => ctx.navigate('lesson', { unitId: unit.id, lessonId: lesson.id })
      }, [
        el('span', { class: 'lesson-card__num' }, done ? '✓' : String(i + 1)),
        el('span', { class: 'lesson-card__title' }, lesson.title)
      ]);
    }));

  const board = el('aside', { class: 'subject-aside' }, [leaderboardEl(unit.id, '')]);

  const body = el('div', { class: 'subject-body' }, [lessons, board]);
  root.appendChild(el('div', { class: 'screen subject' }, [heading, body]));
}
