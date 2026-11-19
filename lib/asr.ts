import type { Verdict } from './types';

export const asrSupported =
  typeof window !== 'undefined' &&
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export function listen(opts: { timeout?: number; lang?: string } = {}): Promise<string[]> {
  const { timeout = 6000, lang = 'ar-SA' } = opts;
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('unsupported'));
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return reject(new Error('unsupported'));

    const r = new SR();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;

    let done = false;
    const finish = (fn: (v: any) => void, val: any) => {
      if (done) return; done = true;
      try { r.stop(); } catch {}
      fn(val);
    };
    const t = setTimeout(() => finish(reject, new Error('timeout')), timeout);

    r.onresult = (e: any) => {
      clearTimeout(t);
      const alts = [...e.results[0]].map((a: any) => a.transcript as string);
      finish(resolve, alts);
    };
    r.onerror = (e: any) => { clearTimeout(t); finish(reject, new Error(e.error || 'asr')); };
    r.onend = () => { clearTimeout(t); finish(reject, new Error('no-speech')); };

    try { r.start(); } catch (err) { clearTimeout(t); finish(reject, err); }
  });
}
