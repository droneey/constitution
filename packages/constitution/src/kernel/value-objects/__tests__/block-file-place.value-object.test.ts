import { describe, expect, it } from 'bun:test';

import { Axis, BlockFormat, Layer } from '../../constants';
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
    const place: object | undefined = BlockFilePlace.parse(path, BlockFormat.Legacy);

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
    const place: object | undefined = BlockFilePlace.parse(path, BlockFormat.Legacy);

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
    const place: object | undefined = BlockFilePlace.parse(path, BlockFormat.Legacy);

    // Assert
    expect(place).toStrictEqual(expected);
  });
});

const placeOf = (path: string, format: BlockFormat = BlockFormat.Legacy): BlockFilePlace => {
  const place = BlockFilePlace.parse(path, format);

  if (place === undefined) {
    throw new Error(`${path} lies outside every layer`);
  }

  return place;
};

const pathOf = (place: BlockFilePlace): string => place.path;

const REACT = 'blocks/implementations/react';

describe('BlockFilePlace.parse of the nested format', () => {
  it.each<{
    block: string;
    file: FileInBlock;
    name: string;
    path: string;
  }>([
    {
      block: 'react',
      file: {
        kind: BlockFileKind.Passport,
      },
      name: "a parent's passport",
      path: `${REACT}/react.md`,
    },
    {
      block: 'react/react-native/expo',
      file: {
        kind: BlockFileKind.Passport,
      },
      name: "a grandchild's passport, named by its last segment",
      path: `${REACT}/react-native/expo/expo.md`,
    },
    {
      block: 'react/react-dom',
      file: {
        axis: Axis.Architecture,
        kind: BlockFileKind.Chapter,
        name: 'document',
      },
      name: "a child's chapter in an axis folder marked by @",
      path: `${REACT}/react-dom/@architecture/document.md`,
    },
    {
      block: 'react/ink',
      file: {
        axis: Axis.Foundation,
        kind: BlockFileKind.Seam,
        other: BlockId.create('presentation/design-system'),
      },
      name: 'a seam with a nested block, named by its id path',
      path: `${REACT}/ink/@foundation/with/presentation/design-system.md`,
    },
    {
      block: 'react',
      file: {
        kind: BlockFileKind.NamedAfterBlock,
      },
      name: 'a chapter named after its block',
      path: `${REACT}/@foundation/react.md`,
    },
    {
      block: 'react',
      file: {
        kind: BlockFileKind.SeamOfNoBlockId,
      },
      name: 'a seam whose path names no block id',
      path: `${REACT}/@foundation/with/Presentation/design-system.md`,
    },
    {
      block: 'react',
      file: STRAY,
      name: 'a file of a folder marked by @ that is no axis',
      path: `${REACT}/@notes/hooks.md`,
    },
    {
      block: 'react',
      file: STRAY,
      name: 'a file of a hidden folder',
      path: `${REACT}/.drafts/hooks.md`,
    },
    {
      block: 'react',
      file: STRAY,
      name: 'a seam under with that is no Markdown',
      path: `${REACT}/@foundation/with/presentation.txt`,
    },
    {
      block: 'react/foundation',
      file: STRAY,
      name: 'a chapter in an axis folder spelled the legacy way, read as a child block',
      path: `${REACT}/foundation/hooks.md`,
    },
  ])('should place $name in its block', ({ block, file, path }) => {
    // Arrange
    const id = BlockId.create(block);

    // Act
    const place: object | undefined = BlockFilePlace.parse(path, BlockFormat.Nested);

    // Assert
    expect(place).toStrictEqual({
      file,
      folder: {
        dir: `blocks/implementations/${id}`,
        id,
        layer: Layer.Implementation,
      },
      path,
      placement: Placement.InBlock,
    });
  });

  it('should place a chapter of core in core when its axis folder is marked by @', () => {
    // Arrange
    const path = 'blocks/core/@workflow/changes.md';

    // Act
    const place: object | undefined = BlockFilePlace.parse(path, BlockFormat.Nested);

    // Assert
    expect(place).toStrictEqual({
      file: {
        axis: Axis.Workflow,
        kind: BlockFileKind.Chapter,
        name: 'changes',
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
        dir: 'blocks/implementations/react/React_Dom',
        layer: Layer.Implementation,
        name: 'React_Dom',
        path: 'blocks/implementations/react/React_Dom/React_Dom.md',
        placement: Placement.MisnamedFolder,
      },
      name: 'a child folder named by no segment of a block id',
    },
    {
      expected: {
        dir: 'blocks/implementations/_react',
        layer: Layer.Implementation,
        name: '_react',
        path: 'blocks/implementations/_react/_react.md',
        placement: Placement.MisnamedFolder,
      },
      name: 'a folder opened by the abstract mark',
    },
    {
      expected: {
        dir: 'blocks/implementations/react/React_Dom',
        layer: Layer.Implementation,
        name: 'React_Dom',
        path: 'blocks/implementations/react/React_Dom/portals/portals.md',
        placement: Placement.MisnamedFolder,
      },
      name: 'a misnamed folder above a child block',
    },
    {
      expected: {
        dir: 'blocks/implementations/@foundation',
        layer: Layer.Implementation,
        name: '@foundation',
        path: 'blocks/implementations/@foundation/code.md',
        placement: Placement.MisnamedFolder,
      },
      name: 'an axis folder straight in a layer',
    },
    {
      expected: {
        dir: 'blocks/implementations/.drafts',
        layer: Layer.Implementation,
        name: '.drafts',
        path: 'blocks/implementations/.drafts/notes.md',
        placement: Placement.MisnamedFolder,
      },
      name: 'a hidden folder straight in a layer',
    },
  ])('should place $name apart from any block', ({ expected }) => {
    // Act
    const place: object | undefined = BlockFilePlace.parse(expected.path, BlockFormat.Nested);

    // Assert
    expect(place).toStrictEqual(expected);
  });

  it('should read a seam named by a nested id as stray in the legacy format', () => {
    // Arrange
    const path = 'blocks/implementations/ink/foundation/with/presentation/design-system.md';

    // Act
    const place = BlockFilePlace.parse(path, BlockFormat.Legacy);

    // Assert
    expect(place?.placement === Placement.InBlock && place.file).toStrictEqual(STRAY);
  });
});

describe('BlockFilePlace.formatOf', () => {
  it.each([
    {
      condition: 'a block folder holds an axis folder marked by @',
      format: BlockFormat.Nested,
      paths: [
        'blocks/core/core.md',
        'blocks/core/@foundation/code.md',
      ],
    },
    {
      condition: 'every axis folder is spelled without @',
      format: BlockFormat.Legacy,
      paths: [
        'blocks/core/core.md',
        'blocks/core/foundation/code.md',
      ],
    },
    {
      condition: 'only a file outside the blocks holds a folder marked by @',
      format: BlockFormat.Legacy,
      paths: [
        'presets/@foundation/code.md',
        'blocks/core/foundation/code.md',
      ],
    },
  ])('should read the tree as $format when $condition', ({ format, paths }) => {
    // Act
    const read = BlockFilePlace.formatOf(paths);

    // Assert
    expect(read).toBe(format);
  });
});

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
  ])('should give the legacy path parse places $name at', ({ block, file, layer, path }) => {
    // Act
    const given = BlockFilePlace.pathOf({
      block: BlockId.create(block),
      file,
      format: BlockFormat.Legacy,
      layer,
    });

    // Assert
    expect(given).toBe(path);
  });
});

describe('BlockFilePlace.pathOf of the nested format', () => {
  it.each<{
    block: string;
    file: BlockPart;
    name: string;
    path: string;
  }>([
    {
      block: 'react/react-native/expo',
      file: {
        kind: BlockFileKind.Passport,
      },
      name: "a grandchild's passport",
      path: `${REACT}/react-native/expo/expo.md`,
    },
    {
      block: 'react/react-dom',
      file: {
        axis: Axis.Architecture,
        kind: BlockFileKind.Chapter,
        name: 'document',
      },
      name: "a child's chapter",
      path: `${REACT}/react-dom/@architecture/document.md`,
    },
    {
      block: 'react/ink',
      file: {
        axis: Axis.Workflow,
        kind: BlockFileKind.Seam,
        other: BlockId.create('presentation/design-system'),
      },
      name: "a child's seam with a nested block",
      path: `${REACT}/ink/@workflow/with/presentation/design-system.md`,
    },
  ])('should give the path parse places $name at', ({ block, file, path }) => {
    // Act
    const given = BlockFilePlace.pathOf({
      block: BlockId.create(block),
      file,
      format: BlockFormat.Nested,
      layer: Layer.Implementation,
    });

    // Assert
    expect(given).toBe(path);
    expect<object | undefined>(BlockFilePlace.parse(given, BlockFormat.Nested)).toStrictEqual({
      file,
      folder: {
        dir: `blocks/implementations/${block}`,
        id: BlockId.create(block),
        layer: Layer.Implementation,
      },
      path,
      placement: Placement.InBlock,
    });
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
    const ordered = paths
      .map((path) => placeOf(path))
      .toSorted(BlockFilePlace.compare)
      .map(pathOf);

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
      candidate: placeOf(
        'blocks/implementations/react/ink/@foundation/rendering.md',
        BlockFormat.Nested,
      ),
      condition: 'it is the place its path parses to in the nested format',
      isPlace: true,
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
