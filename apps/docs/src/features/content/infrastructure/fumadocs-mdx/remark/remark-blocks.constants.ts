import { Level } from '@droneey/constitution';

type LevelLetters = Readonly<Partial<Record<Level, string>>>;

const LEVEL_LETTERS = {
  [Level.Must]: 'M',
  [Level.Should]: 'S',
} as const satisfies LevelLetters;

enum ExampleTone {
  Avoid = 'avoid',
  Prefer = 'prefer',
}

const exampleTonesByTitle: ReadonlyMap<string, ExampleTone> = new Map([
  [
    'Avoid',
    ExampleTone.Avoid,
  ],
  [
    'Prefer',
    ExampleTone.Prefer,
  ],
]);

export type { LevelLetters };
export { ExampleTone, exampleTonesByTitle, LEVEL_LETTERS };
