'use strict';

// Lesson runner: walks the visitor through one lesson's exercise queue with a
// progress bar and a success footer. Relaxed museum mode — wrong answers never
// end the lesson; the visitor just tries again. Performance (accuracy + speed)
// is scored and feeds the subject's arcade leaderboard.

import { buildLessonQueue } from '../engine.js';
import { el, clear } from '../util.js';
import { mountExercise } from '../exercises/index.js';

const PRAISE = ['Goed zo!', 'Knap!', 'Mooi!', 'Net!', 'Hèèl good!'];

// speed: full marks at <=3s/question, decaying to 0.6 at >=12s/question.
function speedFactor(avgSec) {
  const f = 1.0 - ((avgSec - 3) / 9) * 0.4;
  return Math.max(0.6, Math.min(1.0, f));
}

export function renderLesson(root, ctx, params) {
  clear(root);

  const unit = (ctx.course.units || []).find((u) => u.id === params.unitId);
  const lesson = unit && (unit.lessons || []).find((l) => l.id === params.lessonId);
  if (!unit || !lesson) return ctx.navigate('home');

  const queue = buildLessonQueue(unit, lesson);
  let index = 0;

  // per-question scoring state
  let wrongCount = 0;
  let itemStart = 0;
  const perQ = [];        // accuracy score per question (0..1)
  let totalMs = 0;

  const progressFill = el('div', { class: 'progress__fill' });
  const closeBtn = el('button', {
    class: 'icon-btn',
    'aria-label': 'Sluiten',
    onclick: () => ctx.navigate('subject', { unitId: unit.id })
  }, '✕');
  const topbar = el('div', { class: 'lesson-top' }, [
    closeBtn,
    el('div', { class: 'progress' }, [progressFill])
  ]);

  const stage = el('div', { class: 'stage' });
  const footer = el('div', { class: 'footer' });

  root.appendChild(el('div', { class: 'screen lesson' }, [topbar, stage, footer]));

  const api = {
    solved: () => {
      totalMs += performance.now() - itemStart;
      perQ.push(wrongCount === 0 ? 1.0 : Math.max(0.2, 0.6 - 0.1 * wrongCount));
      showSuccessFooter();
    },
    wrong: () => {
      wrongCount++;
      flashWrong();
    }
  };

  function setProgress() {
    progressFill.style.width = (index / queue.length) * 100 + '%';
  }

  function showItem() {
    clear(stage);
    clear(footer);
    footer.className = 'footer';
    wrongCount = 0;
    itemStart = performance.now();
    setProgress();
    if (index >= queue.length) return finish();
    mountExercise(stage, queue[index], api);
  }

  function showSuccessFooter() {
    footer.className = 'footer is-success';
    const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    clear(footer);
    footer.appendChild(el('span', { class: 'footer__msg' }, '✓ ' + praise));
    footer.appendChild(el('button', { class: 'btn btn--go', onclick: next }, 'Doorgaan'));
  }

  function flashWrong() {
    footer.classList.remove('is-nudge');
    void footer.offsetWidth;
    footer.classList.add('is-nudge');
  }

  function next() {
    index++;
    showItem();
  }

  function finish() {
    progressFill.style.width = '100%';
    ctx.session.completed.add(lesson.id);

    const n = perQ.length || 1;
    const accuracy = perQ.reduce((a, b) => a + b, 0) / n;
    const avgSec = totalMs / 1000 / n;
    const score = Math.round(1000 * accuracy * speedFactor(avgSec));

    const lessons = unit.lessons || [];
    const pos = lessons.indexOf(lesson);
    const nextLesson = lessons[pos + 1] || null;

    ctx.navigate('complete', {
      unitId: unit.id,
      score,
      acc: accuracy,
      ms: totalMs,
      nextLesson: nextLesson
        ? { unitId: unit.id, lessonId: nextLesson.id, title: nextLesson.title }
        : null
    });
  }

  if (queue.length === 0) return finish();
  showItem();
}
