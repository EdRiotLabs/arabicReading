'use client';
import { useEffect, useRef, useState } from 'react';
import { play, stop } from '@/lib/audio';
import { drawSet } from '@/lib/generator';
import type { Level } from '@/lib/types';

export function Drill({ level, onDone }: { level: Level; onDone: (r: { seen: number; avgMs: number }) => void }) {
  const [set] = useState(() => drawSet(level, 20));
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(1);
  const startRef = useRef(performance.now());
  const totalRef = useRef(0);
  const rafRef = useRef<number>();
  const DURATION = 3000;

  useEffect(() => {
    const it = set[i];
    if (!it) return;
    play(it.id, it.text);
    startRef.current = performance.now();
    setProgress(1);

    const tick = () => {
      const left = Math.max(0, 1 - (performance.now() - startRef.current) / DURATION);
      setProgress(left);
      if (left <= 0) { next(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [i]);

  const next = () => {
    totalRef.current += performance.now() - startRef.current;
    if (i + 1 >= set.length) {
      stop();
      onDone({ seen: set.length, avgMs: Math.round(totalRef.current / set.length) });
      return;
    }
    setI(i + 1);
  };

  const it = set[i];
  if (!it) return null;
  const cls = progress < .34 ? 'timer bad' : progress < .67 ? 'timer warn' : 'timer';

  return (
    <>
      <div className={cls}><i style={{ width: `${progress * 100}%` }} /></div>
      <div className="card"><p className="arabic">{it.text}</p></div>
      <div className="row">
        <button className="btn sec" onClick={() => play(it.id, it.text)}>Replay ▶</button>
        <button className="btn" onClick={next}>Skip ›</button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
        {i + 1} / {set.length}
      </p>
    </>
  );
}
