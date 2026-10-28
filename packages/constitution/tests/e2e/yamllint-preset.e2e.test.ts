import { describe, expect, it } from 'bun:test';

import { lintedFiles, lintFile } from './yamllint-preset.fixtures';

describe("the configuration yamllint's presets write", () => {
  it('should load in yamllint with no rule or option it does not know when a unit follows every block yamllint is configured for', async () => {
    // Act
    const lint = await lintFile({
      path: '.yamllint.yaml',
    });

    // Assert
    expect(lint).toStrictEqual({
      rules: [],
      status: 0,
    });
  });

  // Why: yamllint skips a key it does not know at the top of its configuration, so each top-level
  // key the presets write has a sample it must react to, beside a sample that keeps every rule.
  it.each([
    {
      condition: 'a document keeps every rule',
      rules: [],
      status: 0,
      text: 'kind: order\n',
    },
    {
      condition: 'a sequence is written in flow style, which the rules the presets set forbid',
      rules: [
        'brackets',
      ],
      status: 1,
      text: 'kinds: [order, refund]\n',
    },
    {
      condition: 'a line ends in spaces, which the default rules the presets extend forbid',
      rules: [
        'trailing-spaces',
      ],
      status: 1,
      text: 'kind: order   \n',
    },
  ])('should report $rules when $condition', async ({ rules, status, text }) => {
    // Act
    const lint = await lintFile({
      path: 'sample.yaml',
      text,
    });

    // Assert
    expect(lint).toStrictEqual({
      rules,
      status,
    });
  });

  it('should leave out the paths git ignores and the lockfiles mise writes when the ignore files are read', () => {
    // Arrange
    const yaml = 'name: constitution\n';

    // Act
    const files = lintedFiles({
      '.claude/worktrees/feature/kept.yaml': yaml,
      '.mise/locks/tool/1.0.0/aube-lock.yaml': yaml,
      'valid.yaml': yaml,
    });

    // Assert
    expect(files).toStrictEqual([
      '.yamllint.yaml',
      'constitution.yaml',
      'valid.yaml',
    ]);
  });
});
