'use client';
import { useState } from 'react';
import { play } from '@/lib/audio';
import { drawSet } from '@/lib/generator';
import { listen, asrSupported } from '@/lib/asr';
import { grade } from '@/lib/match';
import type { Level, Item } from '@/lib/types';

export function Practice({ level, onDone }: {
  level: Level;
  onDone: (r: { ok: number; retry: number; bad: number }) => void;
}) {
  const [queue] = useState<Item[]>(() => drawSet(level, 15));
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<{ msg: string; cls: string }>({ msg: '', cls: 'fb' });
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState({ ok: 0, retry: 0, bad: 0 });

  const it = queue[i];
  if (!it) return null;

  const speak = async () => {
    if (busy) return;
    setBusy(true);
    setFb({ msg: 'Listening…', cls: 'fb' });
    try {
      const alts = await listen();
      const v = grade(it.text, alts);
      if (v === 'ok') {
        setCounts(c => ({ ...c, ok: c.ok + 1 }));
        setFb({ msg: '✓ Correct', cls: 'fb ok' });
        setTimeout(() => { setI(i + 1); setFb({ msg: '', cls: 'fb' }); setBusy(false); }, 800);
      } else if (v === 'retry') {
        setCounts(c => ({ ...c, retry: c.retry + 1 }));
        setFb({ msg: 'Almost — try once more', cls: 'fb retry' });
        setBusy(false);
      } else {
        setCounts(c => ({ ...c, bad: c.bad + 1 }));
        setFb({ msg: '✗ Not quite', cls: 'fb bad' });
        setTimeout(() => { setI(i + 1); setFb({ msg: '', cls: 'fb' }); setBusy(false); }, 800);
      }
    } catch {
      setFb({ msg: 'Couldn’t hear you — try again', cls: 'fb retry' });
      setBusy(false);
    }
  };

  const done = () => onDone(counts);
  const last = i + 1 >= queue.length;

  return (
    <>
      <div className="card"><p className="arabic">{it.text}</p></div>
      <div className={fb.cls}>{fb.msg}</div>
      <div className="row">
        <button className="btn sec" onClick={() => play(it.id, it.text)}>Listen ▶</button>
        <button className="btn" onClick={speak} disabled={busy || !asrSupported}>
          🎤 Speak
        </button>
        {last && <button className="btn sec" onClick={done}>Finish</button>}
      </div>
      {!asrSupported && (
        <p style={{ textAlign: 'center', color: 'var(--warn)', fontSize: '.85rem' }}>
          Speech check requires Chrome/Edge with internet.
        </p>
      )}
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
        {i + 1} / {queue.length}
      </p>
    </>
  );
}
