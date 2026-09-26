import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  without,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { linksCheck } from '../links';

const PRINCIPLES = 'blocks/core/principles.md';
const README = 'README.md';

describe('linksCheck', () => {
  it('should report a link to a missing file when a block, the README and the decision log hold one', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = '# Principles\n\nSee [gone](gone.md).\n';
    files[README] = '# constitution\n\nSee [plan](local/plan.md).\n';
    files['DECISIONS.md'] =
      '# Decision Log\n\nSee [the draft](local/draft.md).\n';
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "gone.md"',
        path: PRINCIPLES,
      },
      {
        message: 'links to a missing file "local/plan.md"',
        path: README,
      },
      {
        message: 'links to a missing file "local/draft.md"',
        path: 'DECISIONS.md',
      },
    ]);
  });

  it('should report a link to a missing file when it drops the extension of a file that exists', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = '# Principles\n\nSee [the core file](core).\n';
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "core"',
        path: PRINCIPLES,
      },
    ]);
  });

  it('should accept a link when it leads to a file or a folder, from its file or from the root, or sits in code', () => {
    // Arrange
    const files = validFiles();
    files[README] = [
      '# constitution',
      '',
      'Start with [core](blocks/core/), [the blocks](blocks/) or [the root](./).',
      'Call `handlers[event.type](event)`.',
    ].join('\n');
    files[PRINCIPLES] = [
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

  it('should check the blocks when the README is missing', () => {
    // Arrange
    const files = without({
      files: validFiles(),
      path: README,
    });
    files[PRINCIPLES] = '# Principles\n\nSee [gone](gone.md).\n';
    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "gone.md"',
        path: PRINCIPLES,
      },
    ]);
  });
});
