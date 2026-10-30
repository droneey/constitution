import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import type { Files } from '../../../../__tests__/constitution.fixtures';
import { passportFile } from '../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { BlockPlace } from '../../../block/entities';
import { BlockGraph } from '../block-graph.entity';

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

interface ClosureCase {
  blockId: string;
  expected: string[];
  files: Files;
  name: string;
}

interface ReachCase {
  expected: string[];
  name: string;
  place: PlaceFixture;
}

const implementationRequiring = (input: { id: string; requires: readonly string[] }): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: passportFile({
    body: `# ${input.id}\n`,
    id: input.id,
    requires: input.requires,
  }),
});

describe('closureOf', () => {
  it.each<ClosureCase>([
    {
      blockId: 'react-dom',
      expected: [
        'browser',
        '_react',
        'untrusted-client',
        'ui',
      ],
      files: {},
      name: 'the links cross layers through requires and extends',
    },
    {
      blockId: 'biome',
      expected: [
        'lingui',
      ],
      files: {
        ...implementationRequiring({
          id: 'biome',
          requires: [
            'lingui',
          ],
        }),
        ...implementationRequiring({
          id: 'lingui',
          requires: [
            'biome',
          ],
        }),
      },
      name: 'two blocks require each other',
    },
    {
      blockId: 'biome',
      expected: [
        'nowhere',
        'typescript',
      ],
      files: implementationRequiring({
        id: 'biome',
        requires: [
          'nowhere',
          'typescript',
        ],
      }),
      name: 'a link names no block, which has no links to follow',
    },
  ])(
    'should hold every id the links reach, but not the block itself, when $name',
    ({ blockId, expected, files }) => {
      // Arrange
      const { graph } = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const closure = BlockGraph.closureOf(graph, BlockId.create(blockId));

      // Assert
      expect<readonly string[]>([
        ...closure,
      ]).toStrictEqual(expected);
    },
  );
});

describe('reachableFrom', () => {
  it.each<ReachCase>([
    {
      expected: [
        'browser',
        'untrusted-client',
      ],
      name: 'a passport, which reaches its block and its closure',
      place: {
        block: 'browser',
      },
    },
    {
      expected: [
        'ui',
        'browser',
        'untrusted-client',
      ],
      name: 'a with/ file, which also reaches the block it is named after and its closure',
      place: {
        block: 'ui',
        seam: 'browser',
      },
    },
  ])('should hold every block the place reaches when the place is $name', ({ expected, place }) => {
    // Arrange
    const { graph } = checkInputOf(validFiles());

    // Act
    const reachable = BlockGraph.reachableFrom(graph, placeOf(place));

    // Assert
    expect<readonly string[]>([
      ...reachable,
    ]).toStrictEqual(expected);
  });
});

describe('mayReferTo', () => {
  it.each([
    {
      expected: true,
      from: {
        block: 'ui',
      },
      name: 'a block of a layer above',
      to: 'core',
    },
    {
      expected: true,
      from: {
        block: 'ui',
        seam: 'remote-data',
      },
      name: 'the block its with/ file is named after',
      to: 'remote-data',
    },
    {
      expected: false,
      from: {
        block: 'ui',
      },
      name: 'a block of its own layer outside its closure',
      to: 'i18n',
    },
    {
      expected: false,
      from: {
        block: 'ui',
      },
      name: 'a block of a layer below',
      to: 'react-dom',
    },
    {
      expected: false,
      from: {
        block: 'ui',
      },
      name: 'a block that does not exist',
      to: 'nowhere',
    },
    {
      expected: false,
      from: {
        block: 'nowhere',
      },
      name: 'a block of a layer above from a block that does not exist',
      to: 'core',
    },
  ])('should answer $expected when a file refers to $name', ({ expected, from, to }) => {
    // Arrange
    const { graph } = checkInputOf(validFiles());

    // Act
    const isAllowed = BlockGraph.mayReferTo(graph, {
      from: placeOf(from),
      to: BlockId.create(to),
    });

    // Assert
    expect(isAllowed).toBe(expected);
  });
});

describe('mayCarryOut', () => {
  it.each<{
    expected: boolean;
    from: PlaceFixture;
    name: string;
    to: PlaceFixture;
  }>([
    {
      expected: true,
      from: {
        block: 'browser',
      },
      name: 'a parent in core',
      to: {
        block: 'core',
      },
    },
    {
      expected: true,
      from: {
        block: 'react-dom',
      },
      name: 'a parent in a block its closure reaches',
      to: {
        block: 'ui',
      },
    },
    {
      expected: true,
      from: {
        block: 'ui',
        seam: 'remote-data',
      },
      name: 'a parent in a seam whose other block its place reaches',
      to: {
        block: 'ui',
        seam: 'remote-data',
      },
    },
    {
      expected: false,
      from: {
        block: 'react-dom',
      },
      name: 'a parent in a seam whose other block its place does not reach',
      to: {
        block: 'ui',
        seam: 'remote-data',
      },
    },
    {
      expected: false,
      from: {
        block: 'browser',
      },
      name: 'a parent in a block of a layer above outside its closure',
      to: {
        block: 'i18n',
      },
    },
    {
      expected: false,
      from: {
        block: 'nowhere',
      },
      name: 'a parent in core from a block that does not exist',
      to: {
        block: 'core',
      },
    },
    {
      expected: false,
      from: {
        block: 'browser',
      },
      name: 'a parent in a block that does not exist',
      to: {
        block: 'nowhere',
      },
    },
  ])('should answer $expected when a rule carries out $name', ({ expected, from, to }) => {
    // Arrange
    const { graph } = checkInputOf(validFiles());

    // Act
    const isAllowed = BlockGraph.mayCarryOut(graph, {
      from: placeOf(from),
      to: placeOf(to),
    });

    // Assert
    expect(isAllowed).toBe(expected);
  });
});
