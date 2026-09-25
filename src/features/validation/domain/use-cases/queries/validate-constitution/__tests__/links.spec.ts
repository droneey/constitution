import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  validFiles,
  without,
} from '#/features/constitution/__tests__/fixtures';

import { linksCheck } from '../checks/links';

describe('linksCheck', () => {
  it('should accept links that resolve', () => {
    // Act
    const findings = linksCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a missing target from a block file and from the readme', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] =
      '# Principles\n\nSee [testing](testing.md).\n';
    files['README.md'] = '# constitution\n\nSee [the map](blocks/map.md).\n';

    // Act
    const findings = linksCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "testing.md"',
        path: 'blocks/core/principles.md',
      },
      {
        message: 'links to a missing file "blocks/map.md"',
        path: 'README.md',
      },
    ]);
  });

  it('should check nothing at the root when the readme is absent', () => {
    // Act
    const findings = linksCheck(loadFiles(without(validFiles(), 'README.md')));

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
