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
        file: BlockPathFile.Main,
        id: 'ui',
        layer: Layer.Domain,
        name: 'ui.md',
        with: undefined,
      },
      name: 'the card',
      path: `${UI}/ui.md`,
    },
    {
      expected: {
        axis: Axis.Foundation,
        dir: UI,
        file: BlockPathFile.Chapter,
        id: 'ui',
        layer: Layer.Domain,
        name: 'design-system.md',
        with: undefined,
      },
      name: "a chapter at the block's root",
      path: `${UI}/design-system.md`,
    },
    {
      expected: {
        axis: Axis.Foundation,
        dir: UI,
        file: BlockPathFile.With,
        id: 'ui',
        layer: Layer.Domain,
        name: 'with/i18n.md',
        with: 'i18n',
      },
      name: "a seam at the block's root",
      path: `${UI}/with/i18n.md`,
    },
    {
      expected: {
        axis: Axis.Architecture,
        dir: UI,
        file: BlockPathFile.Chapter,
        id: 'ui',
        layer: Layer.Domain,
        name: 'architecture/ui.md',
        with: undefined,
      },
      name: 'the chapter of the architecture axis named after the block',
      path: `${UI}/architecture/ui.md`,
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
        axis: Axis.Workflow,
        dir: 'blocks/core',
        file: BlockPathFile.Chapter,
        id: 'core',
        layer: Layer.Core,
        name: 'workflow/delivery.md',
        with: undefined,
      },
      name: 'a chapter of core on the workflow axis',
      path: 'blocks/core/workflow/delivery.md',
    },
    {
      expected: {
        axis: Axis.Foundation,
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
    {
      expected: {
        axis: Axis.Foundation,
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
        name: 'foundation/ui.md',
        with: undefined,
      },
      name: 'a folder that is no optional axis',
      path: `${UI}/foundation/ui.md`,
    },
    {
      expected: {
        axis: Axis.Architecture,
        dir: UI,
        file: BlockPathFile.Stray,
        id: 'ui',
        layer: Layer.Domain,
        name: 'architecture/with/old.md/a.md',
        with: undefined,
      },
      name: 'a folder inside the seams of an axis',
      path: `${UI}/architecture/with/old.md/a.md`,
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
