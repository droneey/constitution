import { describe, expect, it } from 'bun:test';

import { budgetRule } from '../rules/budget.rule';
import { loadFiles, validFiles } from './fixtures';

const UI = 'blocks/concerns/ui/ui.md';

describe('budgetRule', () => {
  it('should accept chapters within the budget that open with a title', () => {
    // Act
    const findings = budgetRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should accept a chapter of exactly the budget', () => {
    // Arrange
    const files = validFiles();
    files[UI] = `# UI\n${'line\n'.repeat(499)}`;

    // Act
    const findings = budgetRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a chapter over the budget', () => {
    // Arrange
    const files = validFiles();
    files[UI] = `# UI\n${'line\n'.repeat(500)}`;

    // Act
    const findings = budgetRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'has 501 lines; a chapter stays under 500 or becomes a folder with an index',
        path: UI,
      },
    ]);
  });

  it('should report a chapter that does not open with a level-one heading', () => {
    // Arrange
    const files = validFiles();
    files[UI] = '## UI\n';

    // Act
    const findings = budgetRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'does not open with a level-one heading',
        path: UI,
      },
    ]);
  });
});
