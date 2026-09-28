import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel';

import type { BlockPath } from '../block-path.utils';
import { BlockPathFile, classifyBlockPath } from '../block-path.utils';

const UI = 'blocks/domains/ui';

interface PathInBlock {
  axis: Axis | undefined;
  file: BlockPathFile;
  name: string;
  with: string | undefined;
}

const uiPath = (file: PathInBlock): BlockPath => ({
  dir: UI,
  id: 'ui',
  layer: Layer.Domain,
  ...file,
});

describe('classifyBlockPath', () => {
  it.each<{
    expected: BlockPath;
    name: string;
    path: string;
  }>([
    {
      expected: uiPath({
        axis: undefined,
        file: BlockPathFile.Main,
        name: 'ui.md',
        with: undefined,
      }),
      name: 'the card',
      path: `${UI}/ui.md`,
    },
    {
      expected: uiPath({
        axis: Axis.Foundation,
        file: BlockPathFile.Chapter,
        name: 'foundation/design-system.md',
        with: undefined,
      }),
      name: 'a chapter on the foundation axis',
      path: `${UI}/foundation/design-system.md`,
    },
    {
      expected: uiPath({
        axis: Axis.Workflow,
        file: BlockPathFile.Chapter,
        name: 'workflow/ui.md',
        with: undefined,
      }),
      name: 'a chapter named after its block on the workflow axis',
      path: `${UI}/workflow/ui.md`,
    },
    {
      expected: uiPath({
        axis: Axis.Architecture,
        file: BlockPathFile.With,
        name: 'architecture/with/remote-data.md',
        with: 'remote-data',
      }),
      name: 'a seam on the architecture axis',
      path: `${UI}/architecture/with/remote-data.md`,
    },
    {
      expected: {
        axis: Axis.Foundation,
        dir: 'blocks/core',
        file: BlockPathFile.Chapter,
        id: 'core',
        layer: Layer.Core,
        name: 'foundation/principles.md',
        with: undefined,
      },
      name: 'a chapter of core',
      path: 'blocks/core/foundation/principles.md',
    },
  ])('should classify $name when the path is $path', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const classified = classifyBlockPath(input);

    // Assert
    expect(classified).toStrictEqual(expected);
  });

  it.each([
    `${UI}/design-system.md`,
    `${UI}/with/remote-data.md`,
    `${UI}/design/parts.md`,
    `${UI}/design/with/remote-data.md`,
    `${UI}/foundation`,
    `${UI}/foundation/.draft.md`,
    `${UI}/foundation/parts/a.md`,
    `${UI}/foundation/with/notes.txt`,
    `${UI}/foundation/with/deep/a.md`,
    `${UI}/ui.md/notes.md`,
  ])(
    'should classify %p as a stray when it keeps an old shape, sits outside an axis folder or nests too deep',
    (path) => {
      // Arrange
      const input = path;

      // Act
      const classified = classifyBlockPath(input);

      // Assert
      expect(classified).toStrictEqual(
        uiPath({
          axis: undefined,
          file: BlockPathFile.Stray,
          name: path.slice(UI.length + 1),
          with: undefined,
        }),
      );
    },
  );

  it.each([
    'blocks/domains/ui',
    'blocks/core',
    'docs/ui.md',
  ])(
    'should classify %p as outside every block when it names no file inside a block folder',
    (path) => {
      // Arrange
      const input = path;

      // Act
      const classified = classifyBlockPath(input);

      // Assert
      expect(classified).toStrictEqual(undefined);
    },
  );
});
