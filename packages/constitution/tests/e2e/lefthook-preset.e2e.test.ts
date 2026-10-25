import { describe, expect, it } from 'bun:test';

import {
  checkBranch,
  checkCommitMessage,
  partJobs,
  shellCheckRun,
} from './lefthook-preset.fixtures';

describe('the commit message hook', () => {
  it.each([
    'feat: Add the audit preset',
    'fix: Keep the header within 100 characters',
    'refactor: Move the fixtures beside their specs',
    'chore: Update dependencies',
    'feat!: Split the NestJS settings out of the node preset',
    'fix: Keep the trailers of a signed commit\n\nSigned-off-by: Dmytro Kurovskyi <me@kurovskyi.dev>',
  ])(
    'should accept "%s" when it follows the four types and its footer holds only trailers',
    (message) => {
      // Arrange
      const text = `${message}\n`;

      // Act
      const check = checkCommitMessage(text);

      // Assert
      expect(check).toStrictEqual({
        exitCode: 0,
        output: '',
      });
    },
  );

  it.each([
    {
      condition: 'its type is not one of the four',
      commit: 'docs: Explain the presets',
      output: "Invalid type 'docs'. Allowed: feat, fix, refactor, chore",
    },
    {
      condition: 'it has a scope',
      commit: 'feat(biome): Add a preset',
      output: 'Commit must match format: type: Subject, or type!: Subject for a breaking change',
    },
    {
      condition: 'the colon has no space after it',
      commit: 'feat:Add a preset',
      output: 'Commit must match format: type: Subject, or type!: Subject for a breaking change',
    },
    {
      condition: 'the subject starts in lower case',
      commit: 'fix: keep the header short',
      output: 'Subject must start with an uppercase letter (sentence-case)',
    },
    {
      condition: 'the subject is a placeholder',
      commit: 'chore: Wip',
      output: "Subject 'Wip' says nothing; say what changed",
    },
    {
      condition: 'the subject is a placeholder of two words',
      commit: 'fix: Fix stuff',
      output: "Subject 'Fix stuff' says nothing; say what changed",
    },
    {
      condition: 'the header passes 100 characters',
      commit: `feat: ${'A'.repeat(95)}`,
      output: 'Header must be 100 characters or less (got 101)',
    },
    {
      condition: 'it carries a body',
      commit: 'feat: Add a preset\n\nBecause the kit needs one',
      output: 'Body must be empty; a footer holds only trailers',
    },
    {
      condition: 'its footer holds prose beside a trailer',
      commit: 'feat: Add a preset\n\nSigned-off-by: A Person <a@example.com>\nAnd a note',
      output: 'Body must be empty; a footer holds only trailers',
    },
  ])('should reject a message when $condition', ({ commit, output }) => {
    // Arrange
    const text = `${commit}\n`;

    // Act
    const check = checkCommitMessage(text);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 1,
      output,
    });
  });
});

describe('the branch name hook', () => {
  it.each([
    'feature/288-give-every-rule-of-core-one-home',
    'fix/12-keep-the-trailers',
    'hotfix/7-pin-the-hook',
  ])('should accept "%s" when it names its type, issue and subject', (branch) => {
    // Act
    const check = checkBranch(branch);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      output: '',
    });
  });

  it('should accept a commit when HEAD is detached, as in a rebase or a bisect', () => {
    // Act
    const check = checkBranch(undefined);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      output: '',
    });
  });

  it.each([
    'main',
    'feature/give-every-rule-one-home',
    'docs/12-explain-the-presets',
  ])('should reject "%s" when it lacks a type, an issue or a subject', (branch) => {
    // Act
    const check = checkBranch(branch);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 1,
      output: `Branch '${branch}' must match: (feature|fix|hotfix)/{id}-{name}`,
    });
  });
});

describe('the commands of the hook parts', () => {
  it.each([
    ...partJobs(),
  ])('should pass ShellCheck for $job of the $part part', ({ run }) => {
    // Act
    const check = shellCheckRun(run);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      output: '',
    });
  });
});
