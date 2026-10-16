import { describe, expect, it } from 'bun:test';

import { lintDocuments } from './rumdl-preset.fixtures';

describe('the rumdl preset', () => {
  it('should accept a document with one title, ordered headings, a fenced block and a long line', () => {
    // Arrange
    const document = [
      '# Title',
      '',
      '## Section',
      '',
      `A line of ${'many words '.repeat(20).trim()}.`,
      '',
      '```sh',
      'echo done',
      '```',
      '',
      '<details>',
      '<summary>More</summary>',
      '',
      'Folded.',
      '',
      '</details>',
      '',
    ].join('\n');

    // Act
    const lint = lintDocuments({
      'README.md': document,
    });

    // Assert
    expect(lint).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it('should report a skipped level, a second title, emphasis as a heading, a bare fence and raw HTML', () => {
    // Arrange
    const document = [
      '# Title',
      '',
      '### Skipped',
      '',
      '# Second',
      '',
      '**Fake heading**',
      '',
      '```',
      'echo done',
      '```',
      '',
      '<div>raw</div>',
      '',
    ].join('\n');

    // Act
    const lint = lintDocuments({
      'README.md': document,
    });

    // Assert
    expect(lint).toStrictEqual({
      codes: [
        'MD001',
        'MD025',
        'MD033',
        'MD036',
        'MD040',
      ],
      exitCode: 1,
    });
  });

  it('should report a link to a file the repository lacks', () => {
    // Arrange
    const document = [
      '# Title',
      '',
      'See [the guide](docs/guide.md).',
      '',
    ].join('\n');

    // Act
    const lint = lintDocuments({
      'README.md': document,
    });

    // Assert
    expect(lint).toStrictEqual({
      codes: [
        'MD057',
      ],
      exitCode: 1,
    });
  });

  it('should accept the tags of an agent file that Markdown has no form for', () => {
    // Arrange
    const document = [
      '# Skill',
      '',
      '<example>',
      'A request and its answer.',
      '</example>',
      '',
    ].join('\n');

    // Act
    const lint = lintDocuments({
      'skills/review/SKILL.md': document,
    });

    // Assert
    expect(lint).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it('should report a suppression that silences nothing', () => {
    // Arrange
    const document = [
      '# Title',
      '',
      '<!-- rumdl-disable-next-line MD040 --> <!-- a plain line follows -->',
      'Plain text.',
      '',
    ].join('\n');

    // Act
    const lint = lintDocuments({
      'README.md': document,
    });

    // Assert
    expect(lint).toStrictEqual({
      codes: [
        'MD087',
      ],
      exitCode: 1,
    });
  });
});
