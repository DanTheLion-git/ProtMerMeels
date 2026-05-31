'use strict';

// Home / attract screen: centered title, a 2×2 grid of subject panels on the
// left (each with a hero image + best-score peek), and the tall Turfsteker
// mascot on the right.

import { el, clear } from '../util.js';
import { best } from '../highscore.js';

const ASSET_IMG = '../../assets/img/';

export function renderHome(root, ctx) {
  clear(root);
  const course = ctx.course;

  const title = el('header', { class: 'menu-title' }, [
    el('h1', { class: 'menu-title__main' }, course.meta?.title || 'Pròt mèr Mééls'),
    el('p', { class: 'menu-title__tag' }, 'Leer het Mééls — het dialect van Meijel')
  ]);

  const grid = el('div', { class: 'menu-grid' },
    (course.units || []).map((unit) => renderPanel(unit, ctx)));

  const mascotImg = el('img', {
    class: 'mascot__img',
    src: ASSET_IMG + 'turfsteker.png',
    alt: 'Turfsteker',
    onerror: function () { this.style.display = 'none'; }
  });
  const mascot = el('div', { class: 'mascot' }, [mascotImg]);

  const body = el('div', { class: 'menu-body' }, [grid, mascot]);
  const hint = el('p', { class: 'attract-hint' }, 'Raak een onderwerp aan om te beginnen');

  root.appendChild(el('div', { class: 'screen home' }, [title, body, hint]));
}

function renderPanel(unit, ctx) {
  const top = best(unit.id); // 0 when there is no score yet
  const kids = [];
  if (unit.image) {
    kids.push(el('img', {
      class: 'panel__img',
      src: ASSET_IMG + unit.image,
      alt: '',
      onerror: function () { this.remove(); }
    }));
  }
  // Top-score badge, top-right of the (mostly white) artwork.
  kids.push(el('span', { class: 'panel__score' }, [
    el('span', { class: 'panel__score-star' }, '★'),
    el('span', {}, String(top))
  ]));
  // Title overlaid on the bottom of the artwork.
  kids.push(el('span', { class: 'panel__title' }, unit.title));

  return el('button', {
    class: 'subject-panel',
    onclick: () => ctx.navigate('subject', { unitId: unit.id })
  }, kids);
}
