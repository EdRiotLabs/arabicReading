export type Level = 1 | 2 | 3;

export interface Item {
  id: string;
  text: string;
  level: Level;
  rule: string;
}

export type Verdict = 'ok' | 'retry' | 'bad';
