import { describe, expect, it } from 'bun:test';

import { checkCommitMessage } from './lefthook-preset.fixtures';

describe('the commit message hook', () => {
  it.each([
    'feat: Add the audit preset',
    'fix: Keep the header within 100 characters',
    'refactor: Move the fixtures beside their specs',
    'chore: Update dependencies',
    'feat!: Split the NestJS settings out of the node preset',
    'fix: Keep the trailers of a signed commit\n\nSigned-off-by: Dmytro Kurovskyi <dmytro.kurovskyi@gmail.com>',
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
      message: 'docs: Explain the presets',
      output: "Invalid type 'docs'. Allowed: feat, fix, refactor, chore",
    },
    {
      condition: 'it has a scope',
      message: 'feat(biome): Add a preset',
      output: 'Commit must match format: type: Subject, or type!: Subject for a breaking change',
    },
    {
      condition: 'the colon has no space after it',
      message: 'feat:Add a preset',
      output: 'Commit must match format: type: Subject, or type!: Subject for a breaking change',
    },
    {
      condition: 'the subject starts in lower case',
      message: 'fix: keep the header short',
      output: 'Subject must start with an uppercase letter (sentence-case)',
    },
    {
      condition: 'the subject is a placeholder',
      message: 'chore: Wip',
      output: "Subject 'Wip' says nothing; say what changed",
    },
    {
      condition: 'the subject is a placeholder of two words',
      message: 'fix: Fix stuff',
      output: "Subject 'Fix stuff' says nothing; say what changed",
    },
    {
      condition: 'the header passes 100 characters',
      message: `feat: ${'A'.repeat(95)}`,
      output: 'Header must be 100 characters or less (got 101)',
    },
    {
      condition: 'it carries a body',
      message: 'feat: Add a preset\n\nBecause the kit needs one',
      output: 'Body must be empty; a footer holds only trailers',
    },
    {
      condition: 'its footer holds prose beside a trailer',
      message: 'feat: Add a preset\n\nSigned-off-by: A Person <a@example.com>\nAnd a note',
      output: 'Body must be empty; a footer holds only trailers',
    },
  ])('should reject a message when $condition', ({ message, output }) => {
    // Arrange
    const text = `${message}\n`;

    // Act
    const check = checkCommitMessage(text);

    // Assert
    expect(check).toStrictEqual({
      exitCode: 1,
      output,
    });
  });
});
