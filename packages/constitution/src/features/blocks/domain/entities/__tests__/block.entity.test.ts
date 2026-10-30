import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import { validFiles } from '../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { BlockPlace } from '../block.entity';
import { Block } from '../block.entity';
import type { BlockFile } from '../block-file.entity';

interface PlaceFixture {
  block: string;
  seam?: string;
}

const placeOf = (place: PlaceFixture): BlockPlace => ({
  block: BlockId.create(place.block),
  ...(place.seam === undefined
    ? {}
    : {
        seam: BlockId.create(place.seam),
      }),
});

const blockOfValidTree = (id: string): Block => {
  const block = checkInputOf(validFiles()).graph.get(BlockId.create(id));

  if (block === undefined) {
    throw new Error(`${id} is no block of the valid tree`);
  }

  return block;
};

const fileOfUi = (
  path: string,
): {
  block: Block;
  file: BlockFile;
} => {
  const block = blockOfValidTree('ui');
  const file = Block.filesOf(block).find((candidate) => candidate.path === path);

  if (file === undefined) {
    throw new Error(`${path} is no file of ui in the valid tree`);
  }

  return {
    block,
    file,
  };
};

const pathsOf = (block: Block): readonly string[] => Block.filesOf(block).map((file) => file.path);

describe('Block', () => {
  it.each([
    {
      path: 'blocks/domains/ui/ui.md',
      place: {
        block: 'ui',
      },
    },
    {
      path: 'blocks/domains/ui/architecture/with/remote-data.md',
      place: {
        block: 'ui',
        seam: 'remote-data',
      },
    },
  ])(
    'should place $path in its block, with the other block when it is a seam',
    ({ path, place }) => {
      // Arrange
      const { block, file } = fileOfUi(path);

      // Act
      const placed = Block.placeOf(block, file);

      // Assert
      expect(placed).toStrictEqual(placeOf(place));
    },
  );

  it("should name every file of a block by its path under the base's folder when it is a pack's base", () => {
    // Arrange
    const { block } = fileOfUi('blocks/domains/ui/ui.md');

    // Act
    const base = Block.asBase(block, '.droneey/constitution');

    // Assert
    expect({
      isBase: Block.isBase(base),
      paths: pathsOf(base),
    }).toStrictEqual({
      isBase: true,
      paths: [
        '.droneey/constitution/blocks/domains/ui/ui.md',
        '.droneey/constitution/blocks/domains/ui/foundation/screens.md',
        '.droneey/constitution/blocks/domains/ui/architecture/with/remote-data.md',
      ],
    });
  });

  it.each([
    {
      expected: true,
      name: 'its own copy, read as a base',
      other: 'ui',
    },
    {
      expected: false,
      name: 'another block, read as a base',
      other: 'i18n',
    },
  ])('should answer $expected when a block is compared with $name', ({ expected, other }) => {
    // Arrange
    const ui = blockOfValidTree('ui');
    const compared = Block.asBase(blockOfValidTree(other), '.droneey/constitution');

    // Act
    const isSame = Block.sameAs(ui, compared);

    // Assert
    expect(isSame).toBe(expected);
  });
});
