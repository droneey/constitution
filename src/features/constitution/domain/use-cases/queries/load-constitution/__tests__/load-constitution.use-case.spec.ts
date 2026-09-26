import { describe, expect, it } from 'bun:test';

import {
  loadedOf,
  mainFile,
  rule,
  textOf,
  without,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

describe('loadConstitution', () => {
  it('should load without a finding when the constitution is valid', () => {
    // Arrange
    const files = validFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([]);
  });

  it('should order the blocks by layer, then id, when the constitution is valid', () => {
    // Arrange
    const files = validFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.blocks.map((block) => block.id)).toStrictEqual([
      'core',
      'i18n',
      'remote-data',
      'ui',
      'untrusted-client',
      'browser',
      'typescript',
      '_react',
      'biome',
      'lingui',
      'react-dom',
    ]);
  });

  it.each([
    {
      message:
        'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations',
      path: 'blocks/domains/a11y.md',
    },
    {
      message:
        'is not a block file; a block holds its main file, its chapters and with/<block>.md',
      path: 'blocks/domains/ui/notes.txt',
    },
  ])('should report $path when it is no block file', ({ message, path }) => {
    // Arrange
    const files = validFiles();
    files[path] = 'text\n';

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        message,
        path,
      },
    ]);
  });

  it('should report both blocks when two layers hold the same id', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/ui/ui.md'] = mainFile({
      body: '# UI kit\n',
      id: 'ui',
      kind: 'implementation',
    });

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        message:
          'shares the id "ui" with blocks/implementations/ui/ui.md; an id names one block',
        path: 'blocks/domains/ui/ui.md',
      },
      {
        message:
          'shares the id "ui" with blocks/domains/ui/ui.md; an id names one block',
        path: 'blocks/implementations/ui/ui.md',
      },
    ]);
  });

  it('should read neither rules nor answers when they sit in a code fence', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = [
      textOf({
        files,
        path: 'blocks/core/principles.md',
      }),
      '````markdown',
      rule({
        slug: 'sample-rule',
      }),
      '## Requirements',
      '| `sample-rule` | sample | met |',
      '````',
    ].join('\n');

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect([
      loaded.constitution.rules.some((parsed) => parsed.slug === 'sample-rule'),
      loaded.constitution.requirementAnswers.map((answer) => answer.file),
    ]).toStrictEqual([
      false,
      [
        'blocks/implementations/lingui/lingui.md',
      ],
    ]);
  });

  it('should report a heading when it looks like a rule outside a fence', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = `${textOf({
      files,
      path: 'blocks/core/principles.md',
    })}\n### loose · MUST\n`;

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        message:
          'heading "### loose · MUST" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"',
        path: 'blocks/core/principles.md',
      },
    ]);
  });

  it('should parse the plugin documents and keep the README text when every document exists', () => {
    // Arrange
    const files = validFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents).toStrictEqual({
      hooks: {
        status: 'parsed',
        value: {
          commands: [],
        },
      },
      marketplace: {
        status: 'parsed',
        value: {
          plugins: [
            {
              name: 'constitution',
              source: './',
            },
          ],
        },
      },
      plugin: {
        status: 'parsed',
        value: {
          name: 'constitution',
          skills: [],
        },
      },
      readme: '# constitution\n\nStart with [core](blocks/core/core.md).\n',
    });
  });

  it('should leave a document out when its file does not exist', () => {
    // Arrange
    const files = without({
      files: validFiles(),
      path: 'hooks/hooks.json',
    });

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents.hooks).toBeUndefined();
  });
});
