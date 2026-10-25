import { Level } from '@droneey/constitution';

const LEVEL_LETTERS: Readonly<Record<Level, string>> = {
  [Level.May]: 'Y',
  [Level.Must]: 'M',
  [Level.Should]: 'S',
} as const;

const exampleTones: ReadonlyMap<string, string> = new Map([
  [
    'Avoid',
    'avoid',
  ],
  [
    'Prefer',
    'prefer',
  ],
]);

export { exampleTones, LEVEL_LETTERS };
