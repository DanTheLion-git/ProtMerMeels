'use strict';

// Small shared helpers used across screens and exercises.

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Pick up to n distractor entries from `pool`, excluding `exclude` ids.
export function pickDistractors(pool, excludeIds, n) {
  const exclude = new Set(excludeIds);
  return sample(pool.filter((e) => !exclude.has(e.id)), n);
}

// Build a DOM element quickly: el('div', { class: 'x' }, [child, 'text'])
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// ---- word similarity (for confusable multiple-choice distractors) ----------

export function levenshtein(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

// 1 = identical, 0 = completely different.
export function similarity(a, b) {
  const max = Math.max(a.length, b.length) || 1;
  return 1 - levenshtein(a, b) / max;
}

// Rank `pool` by how close keyFn(item) is to `target`, return the closest `n`
// (excluding exact-equal strings).
export function mostSimilar(pool, target, n, keyFn = (x) => x) {
  return pool
    .map((item) => ({ item, s: similarity(keyFn(item), target) }))
    .filter((x) => keyFn(x.item) !== target && x.s < 1)
    .sort((x, y) => y.s - x.s)
    .slice(0, n)
    .map((x) => x.item);
}

// Generate a plausible-but-fake variant of a Mééls word (used when an entry has
// no curated `near` form): nudge one vowel or double a consonant so it still
// "looks Mééls" but isn't the real word.
export function nearMiss(word) {
  const swaps = { a: 'e', e: 'è', i: 'ie', o: 'ò', u: 'ù', é: 'ee', è: 'e', ó: 'o' };
  const chars = word.split('');
  const vowelIdx = chars.map((c, i) => (/[aeiouéèóò]/i.test(c) ? i : -1)).filter((i) => i >= 0);
  if (vowelIdx.length) {
    const i = vowelIdx[Math.floor(vowelIdx.length / 2)];
    const lower = chars[i].toLowerCase();
    if (swaps[lower]) {
      chars[i] = swaps[lower];
      const out = chars.join('');
      if (out !== word) return out;
    }
  }
  // fallback: double the last consonant
  const last = word[word.length - 1];
  return /[bcdfghjklmnpqrstvwxz]/i.test(last) ? word + last : word + 'e';
}
