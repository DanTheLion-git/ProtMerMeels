'use strict';

// Subject screen: 4 lesson panels in a 2×2 grid, same layout as the home
// subject menu. Each panel shows the lesson's artwork, best score badge, and
// title. Done lessons get a green border + check mark.

import { el, clear } from '../util.js';
import { best } from '../highscore.js';

const ASSET_IMG = '../../assets/img/';

export function renderSubject(root, ctx, params) {
  clear(root);
  const unit = (ctx.course.units || []).find((u) => u.id === params.unitId);
  if (!unit) return ctx.navigate('home');
  const lessons = unit.lessons || [];

  const back = el('button', {
    class: 'icon-btn', 'aria-label': 'Terug',
    onclick: () => ctx.navigate('home')
  }, '←');

  const heading = el('div', { class: 'subject-head' }, [
    back,
    el('h1', { class: 'subject-head__title' }, unit.title)
  ]);

  const grid = el('div', { class: 'menu-grid' },
    lessons.map((lesson) => renderLessonPanel(lesson, ctx, unit.id)));

  root.appendChild(el('div', { class: 'screen subject' }, [heading, grid]));
}

function renderLessonPanel(lesson, ctx, unitId) {
  const done = ctx.session.completed.has(lesson.id);
  const top = best(lesson.id);
  const kids = [];

  kids.push(el('div', {
    class: 'panel__img-wrap',
    style: lesson.image ? `background-image:url("${ASSET_IMG + lesson.image}")` : ''
  }));

  kids.push(el('span', { class: 'panel__score' }, [
    el('span', { class: 'panel__score-star' }, '★'),
    el('span', {}, String(top))
  ]));

  if (done) kids.push(el('span', { class: 'panel__check' }, '✓'));

  kids.push(el('span', { class: 'panel__title' }, lesson.title));

  return el('button', {
    class: 'subject-panel' + (done ? ' is-done' : ''),
    onclick: () => ctx.navigate('lesson', { unitId, lessonId: lesson.id })
  }, kids);
}
