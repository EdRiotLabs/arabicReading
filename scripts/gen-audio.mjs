#!/usr/bin/env node
// Generates drill audio using Edge TTS (ar-SA-ZariyahNeural).
// Prereqs: pip install edge-tts  (+ ffmpeg on PATH for transcode)
// Usage: node scripts/gen-audio.mjs --level 1
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { LETTERS, HARAKAT, LEVELS } from '../lib/arabic.mjs';

const run = promisify(execFile);
const VOICE = 'ar-SA-ZariyahNeural';
const OUT = 'public/audio';

const argLvl = process.argv.indexOf('--level');
const level = Number(argLvl >= 0 ? process.argv[argLvl + 1] : 1);

const jobs = [];

if (level === 1) {
  LETTERS.forEach((ch, i) => {
    jobs.push({ id: `l1_${i}_bare`, text: ch });
    for (const h of LEVELS[1].harakat) {
      jobs.push({ id: `l1_${i}_${h}`, text: ch + HARAKAT[h] });
    }
  });
} else if (level === 2) {
  LETTERS.forEach((a, i) => {
    for (const h1 of LEVELS[2].harakat) {
      LETTERS.forEach((b, j) => {
        for (const h2 of LEVELS[2].second) {
          jobs.push({ id: `l2_${i}_${h1}_${j}_${h2}`, text: a + HARAKAT[h1] + b + HARAKAT[h2] });
        }
      });
    }
  });
} else {
  console.error('Level 3 (curated wordlist) not wired yet. Add WORDLIST in lib/arabic.mjs.');
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

let n = 0;
for (const job of jobs) {
  const file = `${OUT}/${job.id}.mp3`;
  try {
    await run('edge-tts', ['--voice', VOICE, '--rate', '-10%', '--text', job.text, '--write-media', file]);
    n++;
    if (n % 25 === 0) console.log(`${n}/${jobs.length} …`);
  } catch (e) {
    console.error(`FAIL ${job.id}:`, e.message);
  }
}

await writeFile(`${OUT}/manifest.json`, JSON.stringify(Object.fromEntries(jobs.map(j => [j.id, j.text])), null, 2));
console.log(`\nDone. ${n}/${jobs.length} clips → ${OUT}/`);
