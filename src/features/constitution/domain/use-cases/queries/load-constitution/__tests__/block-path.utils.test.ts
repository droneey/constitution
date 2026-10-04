import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel';

import type { BlockPath } from '../block-path.utils';
import { BlockPathFile, classifyBlockPath } from '../block-path.utils';

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
        file: BlockPathFile.Chapter,
        id: 'ui',
        layer: Layer.Domain,
        name: 'foundation/design-system.md',
        with: undefined,
      },
      name: 'a chapter on the foundation axis',
      path: `${UI}/foundation/design-system.md`,
    },
    {
      expected: {
        axis: Axis.Architecture,
        dir: UI,
        file: BlockPathFile.With,
        id: 'ui',
        layer: Layer.Domain,
        name: 'architecture/with/remote-data.md',
        with: 'remote-data',
      },
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
    {
      expected: {
        axis: undefined,
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
        name: 'ui.md/notes.md',
        with: undefined,
      },
      name: 'a folder named like the card',
      path: `${UI}/ui.md/notes.md`,
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
