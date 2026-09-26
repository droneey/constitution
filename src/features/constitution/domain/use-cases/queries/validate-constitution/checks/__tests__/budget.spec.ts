import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { budgetCheck } from '../budget';

const linesOf = (count: number): string =>
  Array.from(
    {
      length: count,
    },
    () => 'Line.',
  ).join('\n');

describe('budgetCheck', () => {
  it('should accept a chapter when it holds exactly 500 lines', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = `${linesOf(500)}\n`;
    const input = checkInputOf(files);

    // Act
    const findings = budgetCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a chapter when it holds 501 lines', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = linesOf(501);
    const input = checkInputOf(files);

    // Act
    const findings = budgetCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
        path: 'blocks/core/principles.md',
      },
    ]);
  });

  it('should count the front matter when a main file passes the budget with it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/ui/ui.md'] = mainFile({
      body: linesOf(487),
      id: 'ui',
      kind: 'domain',
    });
    const input = checkInputOf(files);

    // Act
    const findings = budgetCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
        path: 'blocks/domains/ui/ui.md',
      },
    ]);
  });
});
