import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import { checkInputOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { budgetCheck } from '../budget.check';

const PRINCIPLES = 'blocks/core/principles.md';

const linesOf = (count: number): string =>
  Array.from(
    {
      length: count,
    },
    () => 'Line.',
  ).join('\n');

describe('budgetCheck', () => {
  it.each<{
    expected: Finding[];
    lines: number;
  }>([
    {
      expected: [],
      lines: 500,
    },
    {
      expected: [
        {
          message:
            'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
          path: PRINCIPLES,
        },
      ],
      lines: 501,
    },
  ])(
    'should hold a file to 500 lines when it has $lines',
    ({ expected, lines }) => {
      // Arrange
      const files = validFiles();
      files[PRINCIPLES] = linesOf(lines);
      const input = checkInputOf(files);

      // Act
      const findings = budgetCheck(input);

      // Assert
      expect(findings).toStrictEqual(expected);
    },
  );
});
