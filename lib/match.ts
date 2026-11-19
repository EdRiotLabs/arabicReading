const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;

export function normalize(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(DIACRITICS, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/[^\u0600-\u06FF]/g, '')
    .trim();
}

function lev(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export function similarity(target: string, said: string): number {
  const t = normalize(target), s = normalize(said);
  if (!t || !s) return 0;
  return 1 - lev(t, s) / Math.max(t.length, s.length);
}

export function grade(target: string, alternatives: string[] = []): 'ok' | 'retry' | 'bad' {
  let best = 0;
  for (const alt of alternatives) best = Math.max(best, similarity(target, alt));
  if (best >= 0.6) return 'ok';
  if (best >= 0.4) return 'retry';
  return 'bad';
}
