import { describe, expect, it } from 'bun:test';

import { LineRange } from '../../../domain/shared/value-objects';
import { lineRangesOf } from '../line-ranges.utils.ts';

const sectionOf = (hunkLines: readonly string[]): string =>
  [
    'diff --git a/src/order.utils.ts b/src/order.utils.ts',
    '--- a/src/order.utils.ts',
    '+++ b/src/order.utils.ts',
    ...hunkLines,
  ].join('\n');

describe('lineRangesOf', () => {
  it.each([
    {
      condition: 'a hunk counts its lines in two digits',
      hunkLines: [
        '@@ -12,10 +12,11 @@',
      ],
      lineRanges: [
        LineRange.create({
          endLine: 22,
          startLine: 12,
        }),
      ],
    },
    {
      condition: 'a written line quotes the headers of a diff',
      hunkLines: [
        '@@ -1 +1 @@',
        "+const hunk = '@@ -9 +9 @@';",
        '@@ -5 +5 @@',
        '+const total = 1;',
      ],
      lineRanges: [
        LineRange.create({
          endLine: 1,
          startLine: 1,
        }),
        LineRange.create({
          endLine: 5,
          startLine: 5,
        }),
      ],
    },
    {
      condition: 'a hunk only removes lines',
      hunkLines: [
        '@@ -4,2 +3,0 @@',
      ],
      lineRanges: [],
    },
  ])('should read the lines the section writes when $condition', ({ hunkLines, lineRanges }) => {
    // Act
    const found = lineRangesOf(sectionOf(hunkLines));

    // Assert
    expect(found).toStrictEqual(lineRanges);
  });
});
