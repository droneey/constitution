import { Level } from '@droneey/constitution';

const LEVEL_LETTERS = {
  [Level.May]: 'Y',
  [Level.Must]: 'M',
  [Level.Should]: 'S',
} as const satisfies Readonly<Record<Level, string>>;

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

export { ExampleTone, exampleTonesByTitle, LEVEL_LETTERS };
