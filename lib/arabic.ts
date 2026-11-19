
import raw from './arabic.json';

export interface LevelDef {
  name: string;
  harakat: string[];
  second?: string[];
  bare?: boolean;
}

export type Level = 1 | 2 | 3;

export const LETTERS: string[] = raw.LETTERS;
export const HARAKAT: Record<string, string> = raw.HARAKAT;
export const HARAKA_LABEL: Record<string, string> = raw.HARAKA_LABEL;
export const LEVELS = raw.LEVELS as unknown as Record<Level, LevelDef>;
