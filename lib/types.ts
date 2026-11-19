export type { Level } from './arabic';

export interface Item {
  id: string;
  text: string;
  level: 1 | 2 | 3;
  rule: string;
}

export type Verdict = 'ok' | 'retry' | 'bad';
