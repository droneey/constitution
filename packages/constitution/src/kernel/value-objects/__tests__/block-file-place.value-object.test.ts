import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '../../constants';
import type { BlockPart, FileInBlock } from '../block-file-place.value-object';
import { BlockFileKind, BlockFilePlace, Placement } from '../block-file-place.value-object';
import { BlockId, coreBlockId } from '../block-id.value-object';

const UI = 'blocks/domains/ui';
const uiFolder = {
  dir: UI,
  id: BlockId.create('ui'),
  layer: Layer.Domain,
};
const STRAY = {
  kind: BlockFileKind.Stray,
} as const;

describe('BlockFilePlace.parse', () => {
  it.each<{
    file: FileInBlock;
    name: string;
    path: string;
  }>([
    {
      file: {
        kind: BlockFileKind.Passport,
      },
      name: 'the passport',
      path: `${UI}/ui.md`,
    },
    {
      file: {
        kind: BlockFileKind.NamedAfterBlock,
      },
      name: 'a file of an axis named after its block',
      path: `${UI}/architecture/ui.md`,
    },
    {
      file: {
        axis: Axis.Foundation,
        kind: BlockFileKind.Chapter,
        name: 'design-system',
      },
      name: 'a chapter of foundation',
      path: `${UI}/foundation/design-system.md`,
    },
    {
      file: {
        axis: Axis.Architecture,
        kind: BlockFileKind.Seam,
        other: BlockId.create('remote-data'),
      },
      name: 'a seam of architecture',
      path: `${UI}/architecture/with/remote-data.md`,
    },
    {
      file: {
        kind: BlockFileKind.SeamOfNoBlockId,
      },
      name: 'a seam named after no block id',
      path: `${UI}/architecture/with/Remote_Data.md`,
    },
    {
      file: STRAY,
      name: 'a file below a file',
      path: `${UI}/ui.md/notes.md`,
    },
    {
      file: STRAY,
      name: 'a file at the root that is not the passport',
      path: `${UI}/design-system.md`,
    },
    {
      file: STRAY,
      name: 'a file below a chapter of an axis',
      path: `${UI}/foundation/notes.md/ui.md`,
    },
    {
      file: STRAY,
      name: 'a chapter that is no Markdown',
      path: `${UI}/foundation/notes.mdx`,
    },
    {
      file: STRAY,
      name: 'a hidden chapter',
      path: `${UI}/foundation/.notes.md`,
    },
    {
      file: STRAY,
      name: 'a file of a folder that is no axis',
      path: `${UI}/design/ui.md`,
    },
    {
      file: STRAY,
      name: 'a seam outside an axis',
      path: `${UI}/with/i18n.md`,
    },
    {
      file: STRAY,
      name: 'a file below a seam',
      path: `${UI}/architecture/with/old.md/a.md`,
    },
    {
      file: STRAY,
      name: 'a seam that is no Markdown',
      path: `${UI}/architecture/with/i18n.txt`,
    },
    {
      file: STRAY,
      name: 'a file of a folder of an axis that is not with',
      path: `${UI}/architecture/parts/i18n.md`,
    },
  ])('should place $name in its block when the path is $path', ({ file, path }) => {
    // Act
    // the place a caller reads: its fields, the brand being the compiler's alone
    const place: object | undefined = BlockFilePlace.parse(path);

    // Assert
    expect(place).toStrictEqual({
      file,
      folder: uiFolder,
      path,
      placement: Placement.InBlock,
    });
  });

  it('should place a chapter of core in core when the path lies in its folder', () => {
    // Arrange
    const path = 'blocks/core/workflow/delivery.md';

    // Act
    // the place a caller reads: its fields, the brand being the compiler's alone
    const place: object | undefined = BlockFilePlace.parse(path);

    // Assert
    expect(place).toStrictEqual({
      file: {
        axis: Axis.Workflow,
        kind: BlockFileKind.Chapter,
        name: 'delivery',
      },
      folder: {
        dir: 'blocks/core',
        id: coreBlockId,
        layer: Layer.Core,
      },
      path,
      placement: Placement.InBlock,
    });
  });

  it.each([
    {
      expected: {
        dir: 'blocks/domains/Design_System',
        layer: Layer.Domain,
        name: 'Design_System',
        path: 'blocks/domains/Design_System/Design_System.md',
        placement: Placement.MisnamedFolder,
      },
      name: 'a file of a block folder named by no block id',
      path: 'blocks/domains/Design_System/Design_System.md',
    },
    {
      expected: {
        layer: Layer.Language,
        path: 'blocks/contexts/languages/README.md',
        placement: Placement.Loose,
      },
      name: "a file at the root of a layer's folder",
      path: 'blocks/contexts/languages/README.md',
    },
    {
      expected: undefined,
      name: 'a file beside the layers',
      path: 'blocks/contexts/README.md',
    },
    {
      expected: undefined,
      name: 'a file outside the blocks',
      path: 'presets/biome/foundation.yaml',
    },
  ])('should place $name apart from any block when the path is $path', ({ expected, path }) => {
    // Act
    // the place a caller reads: its fields, the brand being the compiler's alone
    const place: object | undefined = BlockFilePlace.parse(path);

    // Assert
    expect(place).toStrictEqual(expected);
  });
});

const placeOf = (path: string): BlockFilePlace => {
  const place = BlockFilePlace.parse(path);

  if (place === undefined) {
    throw new Error(`${path} lies outside every layer`);
  }

  return place;
};

const pathOf = (place: BlockFilePlace): string => place.path;

describe('BlockFilePlace.pathOf', () => {
  it.each<{
    block: string;
    file: BlockPart;
    layer: Layer;
    name: string;
    path: string;
  }>([
    {
      block: 'ui',
      file: {
        kind: BlockFileKind.Passport,
      },
      layer: Layer.Domain,
      name: "a block's passport",
      path: `${UI}/ui.md`,
    },
    {
      block: 'ui',
      file: {
        axis: Axis.Architecture,
        kind: BlockFileKind.Chapter,
        name: 'screens',
      },
      layer: Layer.Domain,
      name: "a block's chapter",
      path: `${UI}/architecture/screens.md`,
    },
    {
      block: 'react',
      file: {
        axis: Axis.Foundation,
        kind: BlockFileKind.Seam,
        other: BlockId.create('ui'),
      },
      layer: Layer.Implementation,
      name: "a block's seam",
      path: 'blocks/implementations/react/foundation/with/ui.md',
    },
    {
      block: 'core',
      file: {
        kind: BlockFileKind.Passport,
      },
      layer: Layer.Core,
      name: "core's passport",
      path: 'blocks/core/core.md',
    },
  ])('should give the path parse places $name at', ({ block, file, layer, path }) => {
    // Act
    const given = BlockFilePlace.pathOf({
      block: BlockId.create(block),
      file,
      layer,
    });

    // Assert
    expect(given).toBe(path);
  });
});

describe('BlockFilePlace.compare', () => {
  it('should order the files of the blocks by layer, folder name, folder, role, axis and path', () => {
    // Arrange
    const paths = [
      'blocks/implementations/zod/zod.md',
      'blocks/domains/ui-kit/ui-kit.md',
      'blocks/domains/ui/notes.md',
      'blocks/domains/ui/architecture/with/i18n.md',
      'blocks/domains/ui/foundation/with/i18n.md',
      'blocks/domains/ui/workflow/reviews.md',
      'blocks/domains/ui/foundation/forms.md',
      'blocks/domains/ui/foundation/a-b.md',
      'blocks/domains/Bad/Bad.md',
      'blocks/domains/README.md',
      'blocks/domains/ui/ui.md',
      'blocks/core/core.md',
    ];

    // Act
    const ordered = paths.map(placeOf).toSorted(BlockFilePlace.compare).map(pathOf);

    // Assert
    expect(ordered).toStrictEqual([
      'blocks/core/core.md',
      'blocks/domains/README.md',
      'blocks/domains/Bad/Bad.md',
      'blocks/domains/ui/ui.md',
      'blocks/domains/ui/foundation/a-b.md',
      'blocks/domains/ui/foundation/forms.md',
      'blocks/domains/ui/workflow/reviews.md',
      'blocks/domains/ui/foundation/with/i18n.md',
      'blocks/domains/ui/architecture/with/i18n.md',
      'blocks/domains/ui/notes.md',
      'blocks/domains/ui-kit/ui-kit.md',
      'blocks/implementations/zod/zod.md',
    ]);
  });
});

describe('BlockFilePlace', () => {
  const place = placeOf('blocks/domains/ui/foundation/forms.md');

  it.each([
    {
      candidate: place,
      condition: 'it is the place its path parses to',
      isPlace: true,
    },
    {
      candidate: {
        ...place,
        placement: Placement.Loose,
      },
      condition: 'it says other than its path',
      isPlace: false,
    },
    {
      candidate: {
        path: 'notes/forms.md',
      },
      condition: 'its path is in no layer',
      isPlace: false,
    },
    {
      candidate: {
        placement: Placement.Loose,
      },
      condition: 'it has no path',
      isPlace: false,
    },
  ])('should say $isPlace when $condition', ({ candidate, isPlace }) => {
    // Act
    const answer = BlockFilePlace.is(candidate);

    // Assert
    expect(answer).toBe(isPlace);
  });

  it.each([
    {
      condition: 'they are one path',
      isEqual: true,
      path: 'blocks/domains/ui/foundation/forms.md',
    },
    {
      condition: 'they are two paths',
      isEqual: false,
      path: 'blocks/domains/ui/foundation/screens.md',
    },
  ])('should say $isEqual when $condition', ({ isEqual, path }) => {
    // Arrange
    const left = placeOf('blocks/domains/ui/foundation/forms.md');
    const right = placeOf(path);

    // Act
    const isSame = BlockFilePlace.equals(left, right);

    // Assert
    expect(isSame).toBe(isEqual);
  });
});
