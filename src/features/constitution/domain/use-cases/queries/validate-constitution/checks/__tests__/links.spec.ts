import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  without,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { linksCheck } from '../links';

describe('linksCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a link to a missing file when a block and the README hold one', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] =
      '# Principles\n\nSee [gone](gone.md).\n';
    files['README.md'] = '# constitution\n\nSee [plan](local/plan.md).\n';
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "gone.md"',
        path: 'blocks/core/principles.md',
      },
      {
        message: 'links to a missing file "local/plan.md"',
        path: 'README.md',
      },
    ]);
  });

  it('should accept a folder, a root-relative path, code and external links when they resolve or are no links', () => {
    // Arrange
    const files = validFiles();
    files['README.md'] = [
      '# constitution',
      '',
      'Start with [core](blocks/core/) or [the root](./).',
      'Write to [the author](mailto:dev@example.com).',
      'Call `handlers[event.type](event)`.',
    ].join('\n');
    files['blocks/core/principles.md'] = [
      '# Principles',
      '',
      'See [the README](/README.md).',
      '```ts',
      'handlers[event.type](event);',
      '```',
    ].join('\n');
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a link to a missing file when the decision log holds one', () => {
    // Arrange
    const files = validFiles();
    files['DECISIONS.md'] =
      '# Decision Log\n\nSee [the plan](local/plan.md).\n';
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "local/plan.md"',
        path: 'DECISIONS.md',
      },
    ]);
  });

  it('should check the blocks alone when the README is missing', () => {
    // Arrange
    const files = without({
      files: validFiles(),
      path: 'README.md',
    });
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
