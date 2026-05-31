'use strict';

// Loads and indexes the editable course content (content/course.json).
// The renderer lives at src/renderer/, so the content folder is two levels up.

let course = null;
let vocabIndex = new Map();

export async function loadCourse() {
  const res = await fetch('../../content/course.json');
  if (!res.ok) throw new Error('Kon course.json niet laden (' + res.status + ')');
  course = await res.json();

  vocabIndex = new Map();
  for (const [id, entry] of Object.entries(course.vocab || {})) {
    vocabIndex.set(id, normalizeEntry(id, entry));
  }
  return course;
}

function normalizeEntry(id, entry) {
  return {
    id,
    nl: entry.nl ?? '',
    meels: entry.meels ?? '',
    audio: entry.audio ?? null,
    status: entry.status ?? 'review',
    note: entry.note ?? '',
    distractors: Array.isArray(entry.distractors) ? entry.distractors : [],
    near: Array.isArray(entry.near) ? entry.near : []
  };
}

export function getCourse() {
  return course;
}

export function getEntry(id) {
  const e = vocabIndex.get(id);
  if (!e) console.warn('Onbekend vocab-id:', id);
  return e || null;
}

export function getEntries(ids) {
  return ids.map(getEntry).filter(Boolean);
}

export function allEntries() {
  return [...vocabIndex.values()];
}

export function entriesInUnit(unitId) {
  const ids = new Set();
  const unit = (course.units || []).find((u) => u.id === unitId);
  if (!unit) return [];
  for (const lesson of unit.lessons || []) {
    for (const ex of lesson.exercises || []) {
      collectExerciseVocabIds(ex).forEach((id) => ids.add(id));
    }
  }
  return getEntries([...ids]);
}

export function collectExerciseVocabIds(ex) {
  if (Array.isArray(ex.vocab)) return ex.vocab;
  if (typeof ex.vocab === 'string') return [ex.vocab];
  return [];
}

// Count of terms still awaiting native-speaker review (drives the dev banner).
export function reviewCount() {
  let n = 0;
  for (const e of vocabIndex.values()) if (e.status !== 'approved') n++;
  return n;
}
