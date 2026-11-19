'use client';
import { useState } from 'react';
import { play } from '@/lib/audio';
import { makeItem } from '@/lib/generator';
import { HARAKA_LABEL } from '@/lib/arabic.mjs';
import type { Level } from '@/lib/types';

export function Learn({ level }: { level: Level }) {
  const [it, setIt] = useState(() => makeItem(level));

  const next = () => {
    const n = makeItem(level);
    setIt(n);
    play(n.id, n.text);
  };

  return (
    <>
      <div className="card"><p className="arabic">{it.text}</p></div>
      <div className="row">
        <button className="btn sec" onClick={() => play(it.id, it.text, { slow: true })}>Hint</button>
        <button className="btn" onClick={() => play(it.id, it.text)}>Listen ▶</button>
      </div>
      <div className="row">
        <button className="btn sec" onClick={() => setIt(makeItem(level))}>New</button>
        <button className="btn" onClick={next}>Next ›</button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>
        Level {it.level} · {(HARAKA_LABEL as any)[it.rule] || it.rule}
      </p>
    </>
  );
}
