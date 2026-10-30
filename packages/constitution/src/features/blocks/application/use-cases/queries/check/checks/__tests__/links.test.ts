import { describe, expect, it } from 'bun:test';

import { without } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../__tests__/check.fixtures';
import { LinksCode, linksCheck } from '../links';

const PRINCIPLES = 'blocks/core/foundation/principles.md';
const README = 'README.md';

describe('linksCheck', () => {
  it('should resolve the README and the decision log against the repository when the Constitution is a package of it', () => {
    // Arrange
    const files = without({
      files: validFiles(),
      path: README,
    });
    const input = checkInputOf(files, {
      'DECISIONS.md': '# Decision Log\n\nSee [core](packages/constitution/blocks/core/core.md).\n',
      [README]:
        '# constitution\n\nSee [core](blocks/core/core.md) and [the package](packages/constitution/).\n',
      'packages/constitution/blocks/core/core.md': '# Core\n',
    });

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: LinksCode.MissingTarget,
        details: {
          target: 'blocks/core/core.md',
        },
        path: README,
      },
    ]);
  });

  it('should report a link to a missing file when a block, the README and the decision log hold one', () => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = '# Principles\n\nSee [gone](gone.md).\n';
    files[README] = '# constitution\n\nSee [plan](local/plan.md).\n';
    files['DECISIONS.md'] = '# Decision Log\n\nSee [the draft](local/draft.md).\n';

    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: LinksCode.MissingTarget,
        details: {
          target: 'gone.md',
        },
        path: PRINCIPLES,
      },
      {
        code: LinksCode.MissingTarget,
        details: {
          target: 'local/plan.md',
        },
        path: README,
      },
      {
        code: LinksCode.MissingTarget,
        details: {
          target: 'local/draft.md',
        },
        path: 'DECISIONS.md',
      },
    ]);
  });

  it('should report a link to a missing file when it drops the extension of a file that exists', () => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = '# Principles\n\nSee [the workflow](../workflow/workflow).\n';

    const input = checkInputOf(files);

    // Act
    const findings = linksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: LinksCode.MissingTarget,
        details: {
          target: '../workflow/workflow',
        },
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
      'Start with [core](blocks/core/), [its workflow](blocks/core/workflow/), [the blocks](blocks/) or [the root](./).',
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
        code: LinksCode.MissingTarget,
        details: {
          target: 'gone.md',
        },
        path: PRINCIPLES,
      },
    ]);
  });
});
