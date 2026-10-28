import { describe, expect, it } from 'bun:test';

import { goldenFileText } from '#/__tests__/golden.fixtures';

import {
  checkBranch,
  checkCommitMessage,
  checkDetachedHead,
  commitMessageJobs,
  hookTexts,
  shellCheckRun,
  unitJobs,
  validation,
} from './lefthook-preset.fixtures';

// What git commit -v hands the hook below the message: the scissors line and the diff after it.
const verboseDiff = [
  '# ------------------------ >8 ------------------------',
  '# Do not modify or remove the line above.',
  'diff --git a/README.md b/README.md',
  '+An added line',
].join('\n');

const messageRejections = [
  {
    commit: 'docs: Explain the presets',
    condition: 'its type is not one of the four',
    rule: 'commit-header-type-and-subject',
  },
  {
    commit: 'feat(biome): Add a preset',
    condition: 'it has a scope',
    rule: 'commit-header-type-and-subject',
  },
  {
    commit: 'feat:Add a preset',
    condition: 'the colon has no space after it',
    rule: 'commit-header-type-and-subject',
  },
  {
    commit: 'fix: keep the header short',
    condition: 'the subject starts in lower case',
    rule: 'commit-header-type-and-subject',
  },
  {
    commit: 'chore: Wip',
    condition: 'the subject is a placeholder',
    rule: 'commit-subject-never-a-placeholder',
  },
  {
    commit: 'fix: Fix stuff',
    condition: 'the subject is a placeholder of two words',
    rule: 'commit-subject-never-a-placeholder',
  },
  {
    commit: `feat: ${'A'.repeat(95)}`,
    condition: 'the header passes 100 characters',
    rule: 'commit-header-type-and-subject',
  },
  {
    commit: 'feat: Add a preset\n\nBecause the kit needs one',
    condition: 'it carries a body',
    rule: 'commit-body-empty-and-footer-only-trailers',
  },
  {
    commit: 'feat: Add a preset\n\nSigned-off-by: A Person <a@example.com>\nAnd a note',
    condition: 'its footer holds prose beside a trailer',
    rule: 'commit-body-empty-and-footer-only-trailers',
  },
];

const rejectedMessages = messageRejections.map(({ commit }) => commit);

const rejectedBranches = [
  'main',
  'feature/give-every-rule-one-home',
  'docs/12-explain-the-presets',
];

describe("the configuration lefthook's presets write", () => {
  it('should load in lefthook with no key it does not know when a unit follows every block lefthook is configured for', async () => {
    // Act
    const { status } = await validation();

    // Assert
    expect(status).toBe(0);
  });
});

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
      // Act
      const check = checkCommitMessage(`${message}\n`);

      // Assert
      expect(check).toStrictEqual({
        exitCode: 0,
        rules: [],
      });
    },
  );

  it.each(messageRejections)(
    'should reject a message by $rule when $condition',
    ({ commit, rule }) => {
      // Act
      const check = checkCommitMessage(`${commit}\n`);

      // Assert
      expect(check).toStrictEqual({
        exitCode: 1,
        rules: [
          rule,
        ],
      });
    },
  );

  it.each([
    'feat: Add the audit preset',
    'fix: Keep the trailers of a signed commit\n\nSigned-off-by: Dmytro Kurovskyi <me@kurovskyi.dev>',
  ])('should accept "%s" when git commit -v writes its diff below the scissors line', (message) => {
    // Act
    const check = checkCommitMessage(`${message}\n${verboseDiff}\n`);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      rules: [],
    });
  });

  it('should reject a body above the scissors line of git commit -v by the body rule', () => {
    // Act
    const check = checkCommitMessage(
      `feat: Add a preset\n\nBecause the kit needs one\n${verboseDiff}\n`,
    );

    // Assert
    expect(check).toStrictEqual({
      exitCode: 1,
      rules: [
        'commit-body-empty-and-footer-only-trailers',
      ],
    });
  });

  it.each([
    'feat(biome): wip',
    'Fix: stuff',
  ])(
    'should reject "%s" by the placeholder rule when an override lowers the header rule',
    (message) => {
      // Act
      const check = checkCommitMessage(`${message}\n`, {
        lowered: [
          'commit-header-type-and-subject',
        ],
      });

      // Assert
      expect(check).toStrictEqual({
        exitCode: 1,
        rules: [
          'commit-subject-never-a-placeholder',
        ],
      });
    },
  );

  it('should reject a header that is only a placeholder by its own rule beside the header rule', () => {
    // Act
    const check = checkCommitMessage('wip\n');

    // Assert
    expect(check).toStrictEqual({
      exitCode: 1,
      rules: [
        'commit-header-type-and-subject',
        'commit-subject-never-a-placeholder',
      ],
    });
  });
});

describe('the jobs of the commit message hook', () => {
  it.each([
    {
      jobs: [
        'commit-header',
        'commit-placeholder',
      ],
      rule: 'commit-body-empty-and-footer-only-trailers',
    },
    {
      jobs: [
        'commit-body',
        'commit-placeholder',
      ],
      rule: 'commit-header-type-and-subject',
    },
    {
      jobs: [
        'commit-body',
        'commit-header',
      ],
      rule: 'commit-subject-never-a-placeholder',
    },
  ])('should keep every job but that of $rule when an override lowers it', ({ jobs, rule }) => {
    // Act
    const kept = commitMessageJobs([
      rule,
    ]);

    // Assert
    expect(kept).toStrictEqual(jobs);
  });
});

describe('the branch name hook', () => {
  it.each([
    'feature/288-give-every-rule-of-core-one-home',
    'fix/12-keep-the-trailers',
    'hotfix/7-pin-the-hook',
  ])('should accept the branch "%s" when it names its type, issue and subject', (branch) => {
    // Act
    const check = checkBranch(branch);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      rules: [],
    });
  });

  it('should accept a commit when HEAD is detached, as in a rebase or a bisect', () => {
    // Act
    const check = checkDetachedHead();

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      rules: [],
    });
  });

  it.each([
    ...rejectedBranches,
  ])('should reject the branch "%s" when it lacks a type, an issue or a subject', (branch) => {
    // Act
    const check = checkBranch(branch);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 1,
      rules: [
        'branch-named-type-issue-name',
      ],
    });
  });
});

describe('the texts of the hooks the presets give', () => {
  it('should word each rejection as the golden file shows when the hooks reject a message or a branch', async () => {
    // Act
    const texts = hookTexts({
      branches: rejectedBranches,
      messages: rejectedMessages,
    });

    // Assert
    expect(texts).toBe(
      await goldenFileText(new URL('lefthook-preset.golden.txt', import.meta.url), texts),
    );
  });
});

describe('the commands of the hooks the presets give', () => {
  it.each([
    ...unitJobs(),
  ])('should pass ShellCheck for the job $job of $hook', ({ run }) => {
    // Act
    const check = shellCheckRun(run);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 0,
      output: '',
    });
  });
});
