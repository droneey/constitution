import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { budgetCheck } from '../checks/budget';

describe('budgetCheck', () => {
  it('should accept 500 lines and report 501', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = 'line\n'.repeat(501);
    files['blocks/domains/ui/with/remote-data.md'] = 'line\n'.repeat(500);

    // Act
    const findings = budgetCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
        path: 'blocks/core/principles.md',
      },
    ]);
  });

  it('should count a file without a trailing newline', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = `${'line\n'.repeat(500)}last`;

    // Act
    const findings = budgetCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
    ]);
  });
});
