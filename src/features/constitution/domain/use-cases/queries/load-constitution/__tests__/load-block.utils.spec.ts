import { describe, expect, it } from 'bun:test';

import { createFakeFileTree } from '#/features/constitution/__tests__/fake-file-tree';
import { mainFile } from '#/features/constitution/__tests__/fixtures';
import { createYamlFrontMatterParser } from '#/features/constitution/adapters/yaml';

import { classifyBlockPath } from '../block-path.utils';
import type { BlockFolder, Located } from '../load-block.utils';
import { groupByFolder, loadBlock } from '../load-block.utils';

const locatedOf = (paths: readonly string[]): readonly Located[] =>
  paths.flatMap((path) => {
    const block = classifyBlockPath(path);

    return block === undefined
      ? []
      : [
          {
            block,
            path,
          },
        ];
  });

const folderOf = (files: Readonly<Record<string, string>>): BlockFolder => {
  const [folder] = groupByFolder(locatedOf(Object.keys(files)));

  if (folder === undefined) {
    throw new Error('The fixture holds no block folder');
  }

  return folder;
};

describe('groupByFolder', () => {
  it('should group the files of each block in the order the blocks first appear when paths interleave', () => {
    // Arrange
    const located = locatedOf([
      'blocks/domains/ui/ui.md',
      'blocks/domains/i18n/i18n.md',
      'blocks/domains/ui/with/i18n.md',
    ]);

    // Act
    const folders = groupByFolder(located);

    // Assert
    expect(
      folders.map((folder) => [
        folder.id,
        folder.layer,
        folder.entries.map((entry) => entry.path),
      ]),
    ).toStrictEqual([
      [
        'ui',
        'domain',
        [
          'blocks/domains/ui/ui.md',
          'blocks/domains/ui/with/i18n.md',
        ],
      ],
      [
        'i18n',
        'domain',
        [
          'blocks/domains/i18n/i18n.md',
        ],
      ],
    ]);
  });
});

describe('loadBlock', () => {
  it('should report the missing main file at the folder when a block has only a chapter', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/parts.md': '# Parts\n',
    };

    // Act
    const loaded = loadBlock({
      folder: folderOf(files),
      parser: createYamlFrontMatterParser(),
      tree: createFakeFileTree(files),
    });

    // Assert
    expect(loaded).toStrictEqual({
      findings: [
        {
          message: 'has no main file ui.md',
          path: 'blocks/domains/ui',
        },
      ],
    });
  });

  it('should return the front-matter findings and no block when the main file does not load', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/ui.md': '# UI\n',
    };

    // Act
    const loaded = loadBlock({
      folder: folderOf(files),
      parser: createYamlFrontMatterParser(),
      tree: createFakeFileTree(files),
    });

    // Assert
    expect(loaded).toStrictEqual({
      findings: [
        {
          message: 'has no front matter; a main file opens with it',
          path: 'blocks/domains/ui/ui.md',
        },
      ],
    });
  });

  it('should describe each file in reading order when the block loads', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/a.md': '# A\n',
      'blocks/domains/ui/b.md': '# B\nline\n',
      'blocks/domains/ui/ui.md': mainFile({
        body: '# UI',
        chapters: [
          'b.md',
          'a.md',
        ],
        id: 'ui',
        kind: 'domain',
      }),
      'blocks/domains/ui/with/i18n.md': '# UI with i18n',
    };

    // Act
    const loaded = loadBlock({
      folder: folderOf(files),
      parser: createYamlFrontMatterParser(),
      tree: createFakeFileTree(files),
    });

    // Assert
    expect(
      loaded.block?.files.map((file) => [
        file.path,
        file.role,
        file.lines,
        file.with,
      ]),
    ).toStrictEqual([
      [
        'blocks/domains/ui/ui.md',
        'main',
        15,
        null,
      ],
      [
        'blocks/domains/ui/b.md',
        'chapter',
        2,
        null,
      ],
      [
        'blocks/domains/ui/a.md',
        'chapter',
        1,
        null,
      ],
      [
        'blocks/domains/ui/with/i18n.md',
        'with',
        1,
        'i18n',
      ],
    ]);
  });

  it('should report every misplaced file when a chapter carries front matter, another is unlisted and a listed one is missing', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/extra.md': '# Extra\n',
      'blocks/domains/ui/parts.md': '---\nid: parts\n---\n# Parts\n',
      'blocks/domains/ui/ui.md': mainFile({
        body: '# UI\n',
        chapters: [
          'parts.md',
          'gone.md',
        ],
        id: 'ui',
        kind: 'domain',
      }),
    };

    // Act
    const loaded = loadBlock({
      folder: folderOf(files),
      parser: createYamlFrontMatterParser(),
      tree: createFakeFileTree(files),
    });

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        message: 'has front matter; only the main file of a block carries it',
        path: 'blocks/domains/ui/parts.md',
      },
      {
        message: 'is not listed in the chapters of ui',
        path: 'blocks/domains/ui/extra.md',
      },
      {
        message: 'lists the chapter gone.md, which does not exist',
        path: 'blocks/domains/ui/ui.md',
      },
    ]);
  });
});
