'use client';
import { useState, useEffect } from 'react';
import { initAudio } from '@/lib/audio';
import { LEVELS } from '@/lib/arabic.mjs';
import { Learn } from './Learn';
import { Drill } from './Drill';
import { Practice } from './Practice';
import { Test } from './Test';
import type { Level } from '@/lib/types';

type Screen =
  | { name: 'menu' }
  | { name: 'learn' }
  | { name: 'drill' }
  | { name: 'practice' }
  | { name: 'test' }
  | { name: 'results'; kind: 'drill' | 'practice' | 'test'; data: any };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const [level, setLevel] = useState<Level>(1);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    initAudio();
    const upd = () => setOnline(navigator.onLine);
    upd();
    window.addEventListener('online', upd);
    window.addEventListener('offline', upd);
    return () => {
      window.removeEventListener('online', upd);
      window.removeEventListener('offline', upd);
    };
  }, []);

  const back = () => setScreen({ name: 'menu' });
  const titleMap: Record<Screen['name'], string> = {
    menu: 'Arabic Reading',
    learn: `Learn · L${level}`,
    drill: `Drill · L${level}`,
    practice: `Practice · L${level}`,
    test: `Test · L${level}`,
    results: 'Results',
  };

  return (
    <>
      <header className="bar">
        {screen.name !== 'menu' && (
          <button className="ghost" onClick={back} aria-label="Back">←</button>
        )}
        <h1>{titleMap[screen.name]}</h1>
        {!online && <span className="pill">offline</span>}
      </header>
      <main>
        {screen.name === 'menu' && (
          <>
            <div className="menu">
              <button className="btn" onClick={() => setScreen({ name: 'learn' })}>
                <b>Learn</b><span>Untimed · hear the sound</span>
              </button>
              <button className="btn" onClick={() => setScreen({ name: 'drill' })}>
                <b>Drill</b><span>Timed · no scoring</span>
              </button>
              <button className="btn" onClick={() => setScreen({ name: 'practice' })}>
                <b>Practice</b><span>Speak · app checks you</span>
              </button>
              <button className="btn" onClick={() => setScreen({ name: 'test' })}>
                <b>Test</b><span>Scored · no feedback until end</span>
              </button>
            </div>
            <div className="row">
              {Object.entries(LEVELS).map(([n, def]) => {
                const num = Number(n) as Level;
                return (
                  <button
                    key={n}
                    className={`btn ${num === level ? '' : 'sec'}`}
                    onClick={() => setLevel(num)}
                    title={def.name}
                  >
                    L{n}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {screen.name === 'learn' && <Learn level={level} />}
        {screen.name === 'drill' && (
          <Drill level={level} onDone={(d) => setScreen({ name: 'results', kind: 'drill', data: d })} />
        )}
        {screen.name === 'practice' && (
          <Practice level={level} onDone={(d) => setScreen({ name: 'results', kind: 'practice', data: d })} />
        )}
        {screen.name === 'test' && (
          <Test level={level} onDone={(d) => setScreen({ name: 'results', kind: 'test', data: d })} />
        )}
        {screen.name === 'results' && <Results {...screen} onAgain={back} />}
      </main>
    </>
  );
}

function Results({ kind, data, onAgain }: { kind: string; data: any; onAgain: () => void }) {
  if (kind === 'drill') {
    return (
      <>
        <div className="stats">
          <div className="stat"><b>{data.seen}</b><span>cards</span></div>
          <div className="stat"><b>{(data.avgMs / 1000).toFixed(1)}s</b><span>avg</span></div>
        </div>
        <button className="btn wide" onClick={onAgain}>Done</button>
      </>
    );
  }
  if (kind === 'practice') {
    return (
      <>
        <div className="stats">
          <div className="stat"><b>{data.ok}</b><span>correct</span></div>
          <div className="stat"><b>{data.retry}</b><span>retried</span></div>
          <div className="stat"><b>{data.bad}</b><span>missed</span></div>
        </div>
        <button className="btn wide" onClick={onAgain}>Done</button>
      </>
    );
  }
  const pct = Math.round((data.ok / data.total) * 100);
  return (
    <>
      <div className="stats">
        <div className="stat"><b>{data.ok}/{data.total}</b><span>correct</span></div>
        <div className="stat"><b>{pct}%</b><span>score</span></div>
      </div>
      <h3 style={{ margin: '.5rem 0 0' }}>Review</h3>
      <div style={{ display: 'grid', gap: '.5rem' }}>
        {data.results.filter((r: any) => r.verdict !== 'ok').map((r: any, i: number) => (
          <div key={i} className="stat">
            <p className="arabic" style={{ fontSize: '2.5rem', margin: 0 }}>{r.item.text}</p>
          </div>
        ))}
        {data.results.filter((r: any) => r.verdict !== 'ok').length === 0 && (
          <p style={{ color: 'var(--muted)' }}>Nothing to review — perfect set.</p>
        )}
      </div>
      <button className="btn wide" onClick={onAgain}>Done</button>
    </>
  );
}
