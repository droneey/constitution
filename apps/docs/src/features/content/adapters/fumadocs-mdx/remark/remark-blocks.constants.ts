import { Level } from '@droneey/constitution';

const LEVEL_LETTERS = {
  [Level.May]: 'Y',
  [Level.Must]: 'M',
  [Level.Should]: 'S',
} as const satisfies Readonly<Record<Level, string>>;

/** the part a block of an example's code plays beside the others */
enum ExampleTone {
  Avoid = 'avoid',
  Prefer = 'prefer',
}

/** by the title the example gives its code */
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
