import { describe, expect, it } from 'bun:test';

import { FileReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockSource, PackPath } from '#/kernel/value-objects';

import { BlockSetSource, SourceFile, SourceStatus } from '../block-set.entity';

const pack = PackPath.create('./packs/acme');

describe('SourceFile.inReadOrder', () => {
  it('should order by layer, id, folder, then passport, chapters, seams and other files by axis and path, and files in no block last, when the files are shuffled', () => {
    // Arrange
    const files = [
      'blocks/implementations/biome/workflow/hooks.md',
      'blocks/domains/ui/foundation/deep/x.md',
      'blocks/contexts/languages/python/python.md',
      'blocks/domains/ui-kit/ui-kit.md',
      'blocks/core/notes.md',
      'blocks/domains/ui/architecture/with/deep/x.md',
      'blocks/core/architecture/with/api.md',
      'blocks/domains/ui/deep/x.md',
      'blocks/core/foundation/with/ui.md',
      'blocks/domains/ui/foundation/screens.md',
      'blocks/implementations/biome/biome.md',
      'blocks/core/workflow/agents.md',
      'blocks/README.md',
      'blocks/domains/ui/ui.md',
      'blocks/contexts/x.md',
      'blocks/core/architecture/layers.md',
      'blocks/contexts/platforms/web/web.md',
      'blocks/domains/ui/foundation/forms.md',
      'blocks/core/foundation/code.md',
      'blocks/domains/api/api.md',
      'blocks/core/core.md',
      'blocks/implementations/1password/1password.md',
      'blocks/contexts/languages/4d/4d.md',
      'blocks/contexts/languages/python/foundation/types.md',
      'blocks/domains/ui/foundations',
    ].map(
      (path): SourceFile => ({
        path,
        status: FileReadStatus.Unreadable,
      }),
    );

    // Act
    const ordered = SourceFile.inReadOrder(files);

    // Assert
    expect(ordered).toStrictEqual(
      [
        'blocks/core/core.md',
        'blocks/core/foundation/code.md',
        'blocks/core/architecture/layers.md',
        'blocks/core/workflow/agents.md',
        'blocks/core/foundation/with/ui.md',
        'blocks/core/architecture/with/api.md',
        'blocks/core/notes.md',
        'blocks/domains/api/api.md',
        'blocks/domains/ui/ui.md',
        'blocks/domains/ui/foundation/forms.md',
        'blocks/domains/ui/foundation/screens.md',
        'blocks/domains/ui/architecture/with/deep/x.md',
        'blocks/domains/ui/deep/x.md',
        'blocks/domains/ui/foundation/deep/x.md',
        'blocks/domains/ui/foundations',
        'blocks/domains/ui-kit/ui-kit.md',
        'blocks/contexts/platforms/web/web.md',
        'blocks/contexts/languages/4d/4d.md',
        'blocks/contexts/languages/python/python.md',
        'blocks/contexts/languages/python/foundation/types.md',
        'blocks/implementations/1password/1password.md',
        'blocks/implementations/biome/biome.md',
        'blocks/implementations/biome/workflow/hooks.md',
        'blocks/README.md',
        'blocks/contexts/x.md',
      ].map((path) => ({
        path,
        status: FileReadStatus.Unreadable,
      })),
    );
  });
});

describe('BlockSetSource.withoutBlocksFolder', () => {
  it.each<{
    condition: string;
    expected: BlockSetSource;
    holdsPresets: boolean;
    source: BlockSource;
  }>([
    {
      condition: 'a pack keeps presets',
      expected: {
        files: [],
        shownFolderPath: pack,
        source: BlockSource.create(pack),
        status: SourceStatus.Listed,
      },
      holdsPresets: true,
      source: BlockSource.create(pack),
    },
    {
      condition: 'a pack keeps no presets',
      expected: {
        shownFolderPath: pack,
        source: BlockSource.create(pack),
        status: SourceStatus.Unlisted,
      },
      holdsPresets: false,
      source: BlockSource.create(pack),
    },
    {
      condition: 'the release keeps presets',
      expected: {
        shownFolderPath: pack,
        source: BlockSource.create(),
        status: SourceStatus.Unlisted,
      },
      holdsPresets: true,
      source: BlockSource.create(),
    },
  ])('should give the source as $expected.status when $condition', ({ expected, ...given }) => {
    // Arrange
    const input = {
      ...given,
      shownFolderPath: pack,
    };

    // Act
    const listed = BlockSetSource.withoutBlocksFolder(input);

    // Assert
    expect(listed).toStrictEqual(expected);
  });
});

describe('BlockSetSource.frontMattersOf', () => {
  it('should give each front matter the read files open with once, leaving out unlisted sources and unread files', () => {
    // Arrange
    const card = 'id: ui';
    const sources: readonly BlockSetSource[] = [
      {
        files: [
          {
            path: 'blocks/domains/ui/ui.md',
            status: FileReadStatus.Read,
            text: `---\n${card}\n---\n# ui\n`,
          },
          {
            path: 'blocks/domains/ui/foundation/forms.md',
            status: FileReadStatus.Read,
            text: '# Forms\n',
          },
          {
            path: 'blocks/domains/api/api.md',
            status: FileReadStatus.Unreadable,
          },
        ],
        shownFolderPath: AbsolutePath.create('/release'),
        source: BlockSource.create(),
        status: SourceStatus.Listed,
      },
      {
        files: [
          {
            path: 'blocks/domains/ui/ui.md',
            status: FileReadStatus.Read,
            text: `---\n${card}\n---\n# ui, again\n`,
          },
        ],
        shownFolderPath: pack,
        source: BlockSource.create(pack),
        status: SourceStatus.Listed,
      },
      {
        shownFolderPath: pack,
        source: BlockSource.create(pack),
        status: SourceStatus.Unlisted,
      },
    ];

    // Act
    const frontMatters = BlockSetSource.frontMattersOf(sources);

    // Assert
    expect(frontMatters).toStrictEqual([
      card,
    ]);
  });
});
