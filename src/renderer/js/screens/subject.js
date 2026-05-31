'use strict';

// Subject screen: a Duolingo-style path of square lesson cards winding
// left↔right down the screen, joined by a dashed bezier curve, alongside the
// subject's top-5 leaderboard.

import { el, clear } from '../util.js';
import { leaderboardEl } from '../leaderboard.js';

const ASSET_IMG = '../../assets/img/';
const SVGNS = 'http://www.w3.org/2000/svg';

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
    unit.image
      ? el('img', { class: 'subject-head__img', src: ASSET_IMG + unit.image, alt: '', onerror: function () { this.remove(); } })
      : null,
    el('h1', { class: 'subject-head__title' }, unit.title)
  ]);

  // node centres, in 0..100 space; winding left/right
  const pts = lessons.map((_, i) => ({
    x: i % 2 === 0 ? 28 : 72,
    y: ((i + 0.5) / lessons.length) * 100
  }));

  const path = el('div', { class: 'lesson-path' });
  path.appendChild(buildCurve(pts));
  lessons.forEach((lesson, i) => path.appendChild(buildCard(lesson, pts[i], ctx, unit.id)));

  const board = el('aside', { class: 'subject-aside' }, [leaderboardEl(unit.id, '')]);
  const body = el('div', { class: 'subject-body' }, [
    el('div', { class: 'lesson-path-wrap' }, [path]),
    board
  ]);
  root.appendChild(el('div', { class: 'screen subject' }, [heading, body]));
}

function buildCard(lesson, pt, ctx, unitId) {
  const done = ctx.session.completed.has(lesson.id);
  const kids = [];
  if (lesson.image) {
    kids.push(el('img', { class: 'path-card__img', src: ASSET_IMG + lesson.image, alt: '', onerror: function () { this.remove(); } }));
  }
  if (done) kids.push(el('span', { class: 'path-card__check' }, '✓'));
  kids.push(el('span', { class: 'path-card__title' }, lesson.title));

  return el('button', {
    class: 'path-card' + (done ? ' is-done' : ''),
    style: `left:${pt.x}%; top:${pt.y}%`,
    onclick: () => ctx.navigate('lesson', { unitId, lessonId: lesson.id })
  }, kids);
}

// Dashed cubic-bezier S-curve through the node centres.
function buildCurve(pts) {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'path-svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');

  let d = '';
  pts.forEach((p, i) => {
    if (i === 0) { d += `M ${p.x} ${p.y}`; return; }
    const prev = pts[i - 1];
    const midY = (prev.y + p.y) / 2;
    d += ` C ${prev.x} ${midY} ${p.x} ${midY} ${p.x} ${p.y}`;
  });

  const path = document.createElementNS(SVGNS, 'path');
  path.setAttribute('class', 'path-curve');
  path.setAttribute('d', d);
  svg.appendChild(path);
  return svg;
}
