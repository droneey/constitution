import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';

import { BlockPathFile, classifyBlockPath } from '../block-path.utils';

type BlockPath = NonNullable<ReturnType<typeof classifyBlockPath>>;

const UI = 'blocks/domains/ui';

describe('classifyBlockPath', () => {
  it.each<{
    expected: BlockPath;
    name: string;
    path: string;
  }>([
    {
      expected: {
        axis: Axis.Foundation,
        dir: UI,
        file: BlockPathFile.Passport,
        id: 'ui',
        layer: Layer.Domain,
        with: undefined,
      },
      name: 'the passport',
      path: `${UI}/ui.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.NamedAfterBlock,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a file of foundation named after its block',
      path: `${UI}/foundation/ui.md`,
    },
    {
      expected: {
        axis: Axis.Foundation,
        dir: UI,
        file: BlockPathFile.Chapter,
        id: 'ui',
        layer: Layer.Domain,
        with: undefined,
      },
      name: 'a chapter of foundation',
      path: `${UI}/foundation/design-system.md`,
    },
    {
      expected: {
        axis: Axis.Foundation,
        dir: UI,
        file: BlockPathFile.With,
        id: 'ui',
        layer: Layer.Domain,
        with: 'i18n',
      },
      name: 'a seam of foundation',
      path: `${UI}/foundation/with/i18n.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.NamedAfterBlock,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a file of the architecture axis named after its block',
      path: `${UI}/architecture/ui.md`,
    },
    {
      expected: {
        axis: Axis.Architecture,
        dir: UI,
        file: BlockPathFile.Chapter,
        id: 'ui',
        layer: Layer.Domain,
        with: undefined,
      },
      name: 'a chapter of the architecture axis',
      path: `${UI}/architecture/screens.md`,
    },
    {
      expected: {
        axis: Axis.Architecture,
        dir: UI,
        file: BlockPathFile.With,
        id: 'ui',
        layer: Layer.Domain,
        with: 'remote-data',
      },
      name: 'a seam on the architecture axis',
      path: `${UI}/architecture/with/remote-data.md`,
    },
    {
      expected: {
        axis: Axis.Workflow,
        dir: 'blocks/core',
        file: BlockPathFile.Chapter,
        id: 'core',
        layer: Layer.Core,
        with: undefined,
      },
      name: 'a chapter of core on the workflow axis',
      path: 'blocks/core/workflow/delivery.md',
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a folder named like the passport',
      path: `${UI}/ui.md/notes.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a folder of an axis named like a chapter',
      path: `${UI}/foundation/notes.md/ui.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a file of an axis that is not Markdown',
      path: `${UI}/foundation/notes.mdx`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a folder that is no axis',
      path: `${UI}/design/ui.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: "a chapter at the block's root",
      path: `${UI}/design-system.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: "a seam at the block's root",
      path: `${UI}/with/i18n.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a folder inside the seams of an axis',
      path: `${UI}/architecture/with/old.md/a.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a seam in a folder that is no axis',
      path: `${UI}/design/with/i18n.md`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a seam that is not Markdown',
      path: `${UI}/architecture/with/i18n.txt`,
    },
    {
      expected: {
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
      },
      name: 'a file two folders deep in an axis that is no seam',
      path: `${UI}/architecture/parts/i18n.md`,
    },
  ])('should classify $name when the path is $path', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const classified = classifyBlockPath(input);

    // Assert
    expect(classified).toStrictEqual(expected);
  });
});
