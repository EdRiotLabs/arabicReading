import { LETTERS, HARAKAT, LEVELS } from './arabic.mjs';
import type { Item, Level } from './types';

const rnd = (n: number) => Math.floor(Math.random() * n);

export function makeItem(level: Level): Item {
  const L = LEVELS[level];
  const li = rnd(LETTERS.length);

  if (level === 1) {
    const bare = L.bare && Math.random() < 0.25;
    if (bare) {
      const ch = LETTERS[li];
      return { id: `l1_${li}_bare`, text: ch, level, rule: 'bare' };
    }
    const h = L.harakat[rnd(L.harakat.length)];
    return {
      id: `l1_${li}_${h}`,
      text: LETTERS[li] + HARAKAT[h as keyof typeof HARAKAT],
      level, rule: h,
    };
  }

  const lj = rnd(LETTERS.length);
  const h1 = L.harakat[rnd(L.harakat.length)];
  const h2 = (L as any).second[rnd((L as any).second.length)];
  return {
    id: `l${level}_${li}_${h1}_${lj}_${h2}`,
    text:
      LETTERS[li] + HARAKAT[h1 as keyof typeof HARAKAT] +
      LETTERS[lj] + HARAKAT[h2 as keyof typeof HARAKAT],
    level, rule: `${h1}+${h2}`,
  };
}

export function drawSet(level: Level, n: number): Item[] {
  const out: Item[] = [];
  let last: Item | null = null;
  let guard = 0;
  while (out.length < n && guard++ < n * 40) {
    const it = makeItem(level);
    if (last && it.id === last.id) continue;
    out.push(it);
    last = it;
  }
  return out;
}
