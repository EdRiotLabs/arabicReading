const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
let synth: SpeechSynthesis | null = null;
let voice: SpeechSynthesisVoice | null = null;
let current: HTMLAudioElement | null = null;
const misses = new Set<string>();
const hits = new Set<string>();

export function initAudio() {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;
  synth = window.speechSynthesis;
  const pick = () => {
    const vs = synth!.getVoices();
    voice =
      vs.find(v => /ar[-_]SA/i.test(v.lang)) ||
      vs.find(v => /^ar/i.test(v.lang)) ||
      null;
  };
  pick();
  synth.onvoiceschanged = pick;
}

export async function play(id: string, text: string, opts: { slow?: boolean } = {}) {
  if (typeof window === 'undefined') return;
  stop();
  const url = `${BASE}/audio/${id}.mp3`;
  if (!misses.has(id)) {
    try {
      const a = new Audio(url);
      a.playbackRate = opts.slow ? 0.8 : 1;
      await a.play();
      current = a;
      hits.add(id);
      return;
    } catch {
      misses.add(id);
    }
  }
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = opts.slow ? 0.7 : 0.95;
  if (voice) u.voice = voice;
  synth.speak(u);
}

export function stop() {
  if (typeof window === 'undefined') return;
  try { current?.pause(); } catch {}
  current = null;
  try { synth?.cancel(); } catch {}
}
