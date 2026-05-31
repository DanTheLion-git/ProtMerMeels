'use strict';

// Turns a lesson's exercise specs into concrete, renderable runtime items:
// resolves vocab ids into entries, generates distractors, scrambles word banks.
// Exercises themselves stay "dumb" renderers of these items.

import { getEntry, getEntries, entriesInUnit, allEntries } from './content.js';
import { shuffle, sample, pickDistractors, mostSimilar, nearMiss } from './util.js';

const OPTION_COUNT = 4;

export function buildLessonQueue(unit, lesson) {
  const pool = entriesInUnit(unit.id);
  const fallback = allEntries();
  const distractorPool = pool.length >= OPTION_COUNT ? pool : fallback;

  return (lesson.exercises || [])
    .map((spec) => buildItem(spec, distractorPool))
    .filter(Boolean);
}

function buildItem(spec, pool) {
  switch (spec.type) {
    case 'multipleChoice':
      return buildMultipleChoice(spec, pool);
    case 'matchPairs':
      return buildMatchPairs(spec);
    case 'listen':
      return buildListen(spec, pool);
    case 'wordBank':
      return buildWordBank(spec);
    case 'mouillering':
      return buildMouillering(spec, pool);
    default:
      console.warn('Onbekend oefeningstype:', spec.type);
      return null;
  }
}

// Display text of an option for a given direction (used for de-duping).
const optText = (e, dir) => (dir === 'nl2meels' ? e.meels : e.nl);

// De-dupe options by visible text, keep the answer, and pad up to OPTION_COUNT
// with the closest remaining pool entries so we always show four choices.
function finalizeOptions(answer, picks, pool, dir) {
  const seen = new Set();
  const out = [];
  for (const opt of [answer, ...picks]) {
    const t = optText(opt, dir);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(opt);
  }
  if (out.length < OPTION_COUNT) {
    const extra = mostSimilar(pool, optText(answer, dir), pool.length, (e) => optText(e, dir));
    for (const e of extra) {
      if (out.length >= OPTION_COUNT) break;
      const t = optText(e, dir);
      if (e.id === answer.id || seen.has(t)) continue;
      seen.add(t);
      out.push(e);
    }
  }
  return shuffle(out.slice(0, OPTION_COUNT));
}

function buildMultipleChoice(spec, pool) {
  const answer = getEntry(spec.vocab);
  if (!answer) return null;
  // 'nl2meels' (show Dutch, pick Mééls) by default; 'meels2nl' reverses.
  const direction = spec.direction || (Math.random() < 0.5 ? 'nl2meels' : 'meels2nl');

  let picks;
  if (direction === 'nl2meels') {
    // 2 similar REAL Mééls words + 1 plausible-but-fake form (curated or generated).
    const similar = mostSimilar(pool, answer.meels, 2, (e) => e.meels);
    const fakeStr = answer.near[0] || nearMiss(answer.meels);
    const fake = { id: '__fake__', nl: '', meels: fakeStr, status: 'review' };
    picks = [...similar, fake];
  } else {
    // Picking the Dutch meaning: 3 similar real Dutch words (a fake Dutch word the
    // visitor already knows would be pointless).
    picks = mostSimilar(pool, answer.nl, 3, (e) => e.nl);
  }

  const options = finalizeOptions(answer, picks, pool, direction);
  return { type: 'multipleChoice', direction, prompt: answer, answer, options };
}

function buildMatchPairs(spec) {
  const entries = getEntries(Array.isArray(spec.vocab) ? spec.vocab : [spec.vocab]);
  return { type: 'matchPairs', entries: sample(entries, Math.min(entries.length, 5)) };
}

function buildListen(spec, pool) {
  const answer = getEntry(spec.vocab);
  if (!answer) return null;
  // Confusable options: the closest-sounding/looking real Mééls words.
  const similar = mostSimilar(pool, answer.meels, OPTION_COUNT - 1, (e) => e.meels);
  const options = finalizeOptions(answer, similar, pool, 'nl2meels');
  return { type: 'listen', answer, options };
}

function buildWordBank(spec) {
  const prompt = getEntry(spec.vocab);
  if (!prompt) return null;
  const answer = prompt.meels.trim().split(/\s+/);
  // Extra word tiles to make it less trivial come from the entry's distractors.
  const extras = (prompt.distractors || []).slice(0, 2);
  const tokens = shuffle([...answer, ...extras]);
  return { type: 'wordBank', prompt, answer, tokens };
}

function buildMouillering(spec, pool) {
  const entry = getEntry(spec.vocab);
  if (!entry) return null;
  let wrong = entry.distractors.slice();
  if (wrong.length < OPTION_COUNT - 1) {
    // Fall back to other entries' Mééls forms as distractors.
    const others = pickDistractors(pool, [entry.id], OPTION_COUNT - 1 - wrong.length)
      .map((e) => e.meels)
      .filter((m) => m && m !== entry.meels);
    wrong = wrong.concat(others);
  }
  const options = shuffle([entry.meels, ...wrong.slice(0, OPTION_COUNT - 1)]);
  return { type: 'mouillering', prompt: entry, answer: entry.meels, options };
}
