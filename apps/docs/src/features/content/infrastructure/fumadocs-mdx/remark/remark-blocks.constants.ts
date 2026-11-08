import { Level } from '@droneey/constitution';

import { BlockFormat } from '../../../domain/block/entities';

type LevelLetters = Readonly<Partial<Record<Level, string>>>;

const LEVEL_LETTERS = {
  [Level.Must]: 'M',
  [Level.Should]: 'S',
} as const satisfies LevelLetters;

const LEVEL_LETTERS_BY_FORMAT = {
  [BlockFormat.Legacy]: {
    ...LEVEL_LETTERS,
    [Level.May]: 'Y',
  },
  [BlockFormat.Nested]: LEVEL_LETTERS,
} as const satisfies Readonly<Record<BlockFormat, LevelLetters>>;

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
export { ExampleTone, exampleTonesByTitle, LEVEL_LETTERS_BY_FORMAT };
