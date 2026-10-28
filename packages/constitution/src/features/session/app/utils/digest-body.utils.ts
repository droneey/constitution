import { splitFrontMatter } from '#/kernel/utils';

// The digest's budgets count bytes: the room after its header, the warnings' share of it, and the
// room kept for the note of the block list's lines left out.
const BUDGET_BYTES = 9400;
const WARNING_BUDGET_BYTES = 1000;
const LEFT_OUT_NOTE_BYTES = 200;
const encoder = new TextEncoder();

const bytesOf = (line: string): number => encoder.encode(line).length + 1;

const bytesOfLines = (lines: readonly string[]): number =>
  lines.reduce((sum, line) => sum + bytesOf(line), 0);

/** The first lines whose bytes, line breaks included, add up to no more than the budget. */
const linesWithin = (input: { budget: number; lines: readonly string[] }): readonly string[] => {
  let used = 0;

  for (const [index, line] of input.lines.entries()) {
    used += bytesOf(line);

    if (used > input.budget) {
      return input.lines.slice(0, index);
    }
  }

  return input.lines;
};

/** The sections that hold lines, a blank line between each two. */
const joinedSections = (sections: readonly (readonly string[])[]): readonly string[] =>
  sections
    .filter((section) => section.length > 0)
    .flatMap((section, index) =>
      index === 0
        ? section
        : [
            '',
            ...section,
          ],
    );

const warningSection = (input: {
  isStartup: boolean;
  lines: readonly string[];
}): readonly string[] => {
  if (input.lines.length === 0) {
    return [];
  }

  const given = linesWithin({
    budget: WARNING_BUDGET_BYTES,
    lines: input.lines,
  });
  const left = input.lines.length - given.length;

  return [
    input.isStartup ? '⚠️ Warnings — tell the user at the start of the session' : '⚠️ Warnings',
    ...given,
    ...(left > 0
      ? [
          `and ${left} more`,
        ]
      : []),
  ];
};

/** Core's text alone, as the digest gives it when constitution.yaml does not parse. */
const coreBodyOf = (core: string): readonly string[] => {
  const text = splitFrontMatter(core).body.split('\n');
  const first = text.findIndex((line) => line !== '');
  const last = text.findLastIndex((line) => line !== '');

  // With no line of text both ends are -1, and the slice is empty.
  return text.slice(first, last + 1);
};

const blockListSection = (input: { lines: readonly string[]; room: number }): readonly string[] => {
  const given = linesWithin({
    budget: input.room - LEFT_OUT_NOTE_BYTES,
    lines: input.lines,
  });
  const left = input.lines.length - given.length;

  return left === 0
    ? given
    : [
        ...given,
        `${left} ${left === 1 ? 'more line' : 'more lines'} of the block list did not fit; constitution.yaml names every block.`,
      ];
};

interface BudgetedBodyInput {
  readonly blockList: readonly string[];
  readonly core: string;
  readonly isStartup: boolean;
  readonly overrides: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * The warnings' lines, core's text, the overrides and the block list: the warnings within their
 * share of the budget, the block list within what the rest leaves, core and the overrides whole, so
 * a rule the project lowered is never cut.
 */
const budgetedBodyOf = (input: BudgetedBodyInput): readonly string[] => {
  const head = joinedSections([
    warningSection({
      isStartup: input.isStartup,
      lines: input.warnings,
    }),
    coreBodyOf(input.core),
    input.overrides,
  ]);
  const blankBeforeList = head.length > 0 ? bytesOf('') : 0;

  return joinedSections([
    head,
    blockListSection({
      lines: input.blockList,
      room: BUDGET_BYTES - bytesOfLines(head) - blankBeforeList,
    }),
  ]);
};

export { budgetedBodyOf, coreBodyOf };
