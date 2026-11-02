import { splitFrontMatter } from '#/kernel/utils';

import {
  bytesOf,
  bytesOfLines,
  countedNoteOf,
  linesWithin,
  listWithin,
} from './bounded-list.utils';
import {
  mapLinesCutText,
  moreWarningsText,
  STARTUP_WARNINGS_HEADING,
  WARNINGS_HEADING,
} from './digest.messages';
import { capShareOf } from './hook-output.utils';

const CAP_SHARES_PERCENT = {
  body: 94,
  mapCutNote: 2,
  warnings: 10,
} as const;

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

  return [
    input.isStartup ? STARTUP_WARNINGS_HEADING : WARNINGS_HEADING,
    ...listWithin({
      budget: capShareOf(CAP_SHARES_PERCENT.warnings),
      lines: input.lines,
      note: moreWarningsText,
    }),
  ];
};

const coreBodyOf = (core: string): readonly string[] => {
  const text = splitFrontMatter(core).body.split('\n');
  const first = text.findIndex((line) => line !== '');
  const last = text.findLastIndex((line) => line !== '');

  return text.slice(first, last + 1);
};

const mapSection = (input: { lines: readonly string[]; room: number }): readonly string[] => {
  const given =
    bytesOfLines(input.lines) <= input.room
      ? input.lines
      : linesWithin({
          budget: input.room - capShareOf(CAP_SHARES_PERCENT.mapCutNote),
          lines: input.lines,
        });

  return [
    ...given,
    ...countedNoteOf({
      count: input.lines.length - given.length,
      note: mapLinesCutText,
    }),
  ];
};

interface DigestBodyInput {
  readonly blockList: readonly string[];
  readonly core: string;
  readonly duty: readonly string[];
  readonly isStartup: boolean;
  readonly warnings: readonly string[];
}

// Why: the gate relies on core and the duty, so they are never cut; the map takes the room the rest
// leaves within what Claude Code shows of a hook's output.
const digestBodyOf = (input: DigestBodyInput): readonly string[] => {
  const core = coreBodyOf(input.core);
  const warnings = warningSection({
    isStartup: input.isStartup,
    lines: input.warnings,
  });
  const besideMap = joinedSections([
    core,
    input.duty,
    warnings,
  ]);
  const blankBeforeMap = besideMap.length > 0 ? bytesOf('') : 0;

  return joinedSections([
    core,
    input.duty,
    mapSection({
      lines: input.blockList,
      room: capShareOf(CAP_SHARES_PERCENT.body) - bytesOfLines(besideMap) - blankBeforeMap,
    }),
    warnings,
  ]);
};

export { coreBodyOf, digestBodyOf };
