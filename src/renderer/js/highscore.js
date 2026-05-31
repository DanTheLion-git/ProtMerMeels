'use strict';

// Arcade-style top-5 leaderboard per subject, persisted in localStorage.
// Electron keeps localStorage in the app's userData folder, so scores survive
// the idle reset AND app restarts. Only the in-memory session resets on idle —
// never these leaderboards.

const MAX = 5;
const KEY = (unitId) => 'pmm.scores.' + unitId;

export function getTop(unitId) {
  try {
    const raw = localStorage.getItem(KEY(unitId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

// Returns the 0-based rank this score would take (0 = new #1), or -1 if it
// wouldn't make the top 5.
export function qualifies(unitId, score) {
  const list = getTop(unitId);
  if (list.length < MAX) {
    let rank = list.findIndex((e) => score > e.score);
    return rank === -1 ? list.length : rank;
  }
  const rank = list.findIndex((e) => score > e.score);
  return rank; // -1 when it doesn't beat the 5th place
}

// Best score for a subject (for the menu panel peek). 0 if none yet.
export function best(unitId) {
  const list = getTop(unitId);
  return list.length ? list[0].score : 0;
}

export function add(unitId, entry) {
  const list = getTop(unitId);
  list.push({
    name: (entry.name || '???').slice(0, 3).toUpperCase(),
    score: entry.score | 0,
    acc: entry.acc ?? null,
    ms: entry.ms ?? null,
    date: entry.date || new Date().toISOString()
  });
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, MAX);
  try {
    localStorage.setItem(KEY(unitId), JSON.stringify(top));
  } catch (e) {
    console.error('Kon topscore niet opslaan:', e);
  }
  return top;
}
