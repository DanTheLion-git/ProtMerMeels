'use strict';

// Celebration + scoring screen shown after a lesson is finished. Shows the run's
// score (accuracy + speed). If it makes the subject's top 5, the visitor enters
// three initials on an on-screen keypad and the leaderboard updates.

import { el, clear } from '../util.js';
import { qualifies, add } from '../highscore.js';
import { leaderboardEl } from '../leaderboard.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function renderComplete(root, ctx, params) {
  clear(root);

  const unit = (ctx.course.units || []).find((u) => u.id === params.unitId);
  const lesson = unit && (unit.lessons || []).find((l) => l.id === params.lessonId);
  const lessonTitle = lesson ? lesson.title : (unit ? unit.title : '');
  const rank = qualifies(params.lessonId, params.score); // -1 if not top-5
  let savedIndex = -1;

  const confetti = el('div', { class: 'confetti' });
  for (let i = 0; i < 24; i++) {
    confetti.appendChild(
      el('span', {
        class: 'confetti__bit',
        style: `--i:${i};--d:${(Math.random() * 0.6).toFixed(2)}s;--x:${(Math.random() * 100).toFixed(0)}%`
      })
    );
  }

  const card = el('div', { class: 'complete-card' });
  root.appendChild(el('div', { class: 'screen complete' }, [confetti, card]));

  renderScoreView();

  // ---- views ----

  function scoreStats() {
    const accPct = Math.round((params.acc ?? 0) * 100);
    const sec = Math.round((params.ms ?? 0) / 1000);
    return el('div', { class: 'score-stats' }, [
      stat(accPct + '%', 'juist'),
      stat(sec + 's', 'tijd')
    ]);
  }
  function stat(num, lbl) {
    return el('div', { class: 'score-stat' }, [
      el('span', { class: 'score-stat__num' }, num),
      el('span', { class: 'score-stat__lbl' }, lbl)
    ]);
  }

  function renderScoreView() {
    clear(card);
    const kids = [
      el('div', { class: 'complete-badge' }, '★'),
      el('h1', { class: 'complete-title' }, 'Les voltooid!'),
      el('div', { class: 'complete-score' }, [
        el('span', { class: 'complete-score__num' }, String(params.score)),
        el('span', { class: 'complete-score__lbl' }, 'punten')
      ]),
      scoreStats()
    ];
    if (rank >= 0) {
      kids.push(el('p', { class: 'complete-sub complete-sub--win' }, '🏆 Je staat in de top 5! Voer je initialen in:'));
      kids.push(buildKeypad());
    } else {
      kids.push(leaderboardEl(params.lessonId, lessonTitle));
      kids.push(actions());
    }
    kids.forEach((k) => card.appendChild(k));
  }

  function buildKeypad() {
    let entry = '';
    const slots = el('div', { class: 'keypad-slots' });
    const okBtn = el('button', { class: 'btn btn--go', disabled: true, onclick: confirm }, 'OK');

    function drawSlots() {
      clear(slots);
      for (let i = 0; i < 3; i++) {
        slots.appendChild(el('span', { class: 'keypad-slot' + (i === entry.length ? ' is-active' : '') }, entry[i] || ''));
      }
      okBtn.disabled = entry.length < 3;
    }

    const keys = el('div', { class: 'keypad-keys' });
    LETTERS.forEach((ch) => {
      keys.appendChild(el('button', {
        class: 'keypad-key',
        onclick: () => { if (entry.length < 3) { entry += ch; drawSlots(); } }
      }, ch));
    });
    const back = el('button', {
      class: 'keypad-key keypad-key--wide',
      onclick: () => { entry = entry.slice(0, -1); drawSlots(); }
    }, '⌫');
    keys.appendChild(back);

    function confirm() {
      if (entry.length < 3) return;
      const top = add(params.lessonId, { name: entry, score: params.score, acc: params.acc, ms: params.ms });
      savedIndex = top.findIndex((e) => e.name === entry.toUpperCase() && e.score === params.score);
      renderBoardView();
    }

    drawSlots();
    return el('div', { class: 'keypad' }, [slots, keys, okBtn]);
  }

  function renderBoardView() {
    clear(card);
    card.appendChild(el('div', { class: 'complete-badge' }, '🏆'));
    card.appendChild(el('h1', { class: 'complete-title' }, 'In de top 5!'));
    card.appendChild(leaderboardEl(params.lessonId, lessonTitle, { highlightIndex: savedIndex }));
    card.appendChild(actions());
  }

  function actions() {
    const list = [];
    if (params.nextLesson) {
      list.push(el('button', {
        class: 'btn btn--go',
        onclick: () => ctx.navigate('lesson', params.nextLesson)
      }, 'Volgende les →'));
    }
    list.push(el('button', {
      class: 'btn btn--ghost',
      onclick: () => ctx.navigate('subject', { unitId: params.unitId })
    }, 'Terug naar onderwerp'));
    return el('div', { class: 'complete-actions' }, list);
  }
}
