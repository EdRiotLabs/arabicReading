'use client';
import { useState } from 'react';
import { drawSet } from '@/lib/generator';
import { listen, asrSupported } from '@/lib/asr';
import { grade } from '@/lib/match';
import type { Level, Item } from '@/lib/types';

interface Result { item: Item; verdict: 'ok' | 'retry' | 'bad'; }

export function Test({ level, onDone }: {
  level: Level;
  onDone: (r: { results: Result[]; ok: number; total: number }) => void;
}) {
  const [set] = useState<Item[]>(() => drawSet(level, 15));
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);

  const it = set[i];
  if (!it) return null;

  const speak = async () => {
    if (busy) return;
    setBusy(true);
    let v: 'ok' | 'retry' | 'bad' = 'bad';
    try {
      const alts = await listen();
      v = grade(it.text, alts);
    } catch {
      v = 'bad';
    }
    const next = [...results, { item: it, verdict: v }];
    setResults(next);
    setBusy(false);
    if (i + 1 >= set.length) {
      onDone({ results: next, ok: next.filter(r => r.verdict === 'ok').length, total: next.length });
    } else {
      setI(i + 1);
    }
  };

  return (
    <>
      <div className="card"><p className="arabic">{it.text}</p></div>
      <div className="row">
        <button className="btn" onClick={speak} disabled={busy || !asrSupported}>
          🎤 Speak
        </button>
      </div>
      {!asrSupported && (
        <p style={{ textAlign: 'center', color: 'var(--warn)', fontSize: '.85rem' }}>
          Speech check unavailable — score will be 0.
        </p>
      )}
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
        Question {i + 1} / {set.length}
      </p>
    </>
  );
}
