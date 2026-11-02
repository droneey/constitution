import type { CountedText } from './counted-text.utils';
import { countedTextOf } from './counted-text.utils';

const encoder = new TextEncoder();

const bytesOf = (line: string): number => encoder.encode(line).length + 1;

const bytesOfLines = (lines: readonly string[]): number =>
  lines.reduce((sum, line) => sum + bytesOf(line), 0);

interface EntriesWithinInput<TEntry> {
  readonly budget: number;
  readonly entries: readonly TEntry[];
  readonly linesOf: (entry: TEntry) => readonly string[];
}

const entriesWithin = <TEntry>(input: EntriesWithinInput<TEntry>): readonly TEntry[] => {
  let used = 0;

  for (const [index, entry] of input.entries.entries()) {
    used += bytesOfLines(input.linesOf(entry));

    if (used > input.budget) {
      return input.entries.slice(0, index);
    }
  }

  return input.entries;
};

interface LinesWithinInput {
  readonly budget: number;
  readonly lines: readonly string[];
}

const linesWithin = (input: LinesWithinInput): readonly string[] =>
  entriesWithin({
    budget: input.budget,
    entries: input.lines,
    linesOf: (line) => [
      line,
    ],
  });

interface CountedNoteInput {
  readonly count: number;
  readonly note: CountedText;
}

const countedNoteOf = (input: CountedNoteInput): readonly string[] =>
  input.count === 0
    ? []
    : [
        countedTextOf({
          count: input.count,
          text: input.note,
        }),
      ];

interface ListWithinInput extends LinesWithinInput {
  readonly note: CountedText;
}

const listWithin = (input: ListWithinInput): readonly string[] => {
  const given = linesWithin(input);

  return [
    ...given,
    ...countedNoteOf({
      count: input.lines.length - given.length,
      note: input.note,
    }),
  ];
};

export { bytesOf, bytesOfLines, countedNoteOf, entriesWithin, linesWithin, listWithin };
