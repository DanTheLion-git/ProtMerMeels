'use strict';

// Bootstraps the app: loads content, wires the screen router, the idle reset,
// the hidden staff-exit gesture, and the dev review banner.

import { loadCourse, getCourse, reviewCount } from './content.js';
import { initIdle } from './idle.js';
import { renderHome } from './screens/home.js';
import { renderSubject } from './screens/subject.js';
import { renderLesson } from './screens/lesson.js';
import { renderComplete } from './screens/complete.js';

const IDLE_MS = 75000;
const ASSET_IMG = '../../assets/img/';

const appRoot = document.getElementById('app');

// Per-session, per-visitor state. Resets when the table goes idle. Leaderboards
// (in highscore.js / localStorage) persist separately and are NOT reset.
let session = newSession();

function newSession() {
  return { completed: new Set() };
}

const router = {
  navigate(screen, params = {}) {
    appRoot.classList.remove('is-entering');
    // force reflow so the enter animation replays on every navigation
    void appRoot.offsetWidth;
    appRoot.classList.add('is-entering');

    const ctx = { navigate: router.navigate, session, course: getCourse() };
    switch (screen) {
      case 'home':
        renderHome(appRoot, ctx);
        break;
      case 'subject':
        renderSubject(appRoot, ctx, params);
        break;
      case 'lesson':
        renderLesson(appRoot, ctx, params);
        break;
      case 'complete':
        renderComplete(appRoot, ctx, params);
        break;
      default:
        renderHome(appRoot, ctx);
    }
  }
};

function resetToAttract() {
  session = newSession();
  router.navigate('home');
}

async function boot() {
  try {
    await loadCourse();
  } catch (err) {
    appRoot.innerHTML =
      '<div class="fatal"><h1>Kon de lesinhoud niet laden</h1><p>' +
      String(err.message || err) +
      '</p></div>';
    return;
  }

  setupExitGesture();
  setupReviewBanner();
  setupBackground();
  initIdle(IDLE_MS, resetToAttract);

  // Optional deep-links (handy for testing and for an attract loop):
  //   #go=<unitId>/<lessonId>  → straight into a lesson
  //   #subject=<unitId>        → a subject's lessons + leaderboard
  const go = location.hash.match(/^#go=([^/]+)\/(.+)$/);
  const sub = location.hash.match(/^#subject=(.+)$/);
  if (go) {
    router.navigate('lesson', { unitId: decodeURIComponent(go[1]), lessonId: decodeURIComponent(go[2]) });
  } else if (sub) {
    router.navigate('subject', { unitId: decodeURIComponent(sub[1]) });
  } else {
    router.navigate('home');
  }
}

// Optional background image: if assets/img/background.(png|jpg) exists, use it as
// a full-bleed cover; otherwise the CSS default (white, like the museum house
// style) stays in place.
function setupBackground() {
  ['background.png', 'background.jpg'].forEach((file) => {
    const img = new Image();
    img.onload = () => {
      document.body.style.backgroundImage = `url("${ASSET_IMG + file}")`;
      document.body.classList.add('has-bg');
    };
    img.src = ASSET_IMG + file;
  });
}

// Hidden staff exit: press and hold the top-left corner for 3 seconds.
function setupExitGesture() {
  const hotspot = document.getElementById('exit-hotspot');
  let held = null;
  const start = () => {
    held = setTimeout(() => window.kiosk && window.kiosk.quit(), 3000);
  };
  const cancel = () => {
    clearTimeout(held);
    held = null;
  };
  hotspot.addEventListener('pointerdown', start);
  hotspot.addEventListener('pointerup', cancel);
  hotspot.addEventListener('pointerleave', cancel);
}

// Dev-only: surface how many terms still need native-speaker review.
// Hidden automatically in the packaged kiosk build.
function setupReviewBanner() {
  const isPackaged = location.href.includes('app.asar') || !/^file:\/\/.*\/src\//.test(location.href);
  if (isPackaged) return;
  const n = reviewCount();
  if (n === 0) return;
  const banner = document.getElementById('review-banner');
  banner.textContent = '⚠ ' + n + ' termen nog te controleren door moedertaalspreker';
  banner.hidden = false;
}

boot();
