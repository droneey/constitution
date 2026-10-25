import { describe, expect, it } from 'bun:test';

import { BlockSource, SourceKind } from '../block-source.value-object';
import { PackPath } from '../pack-path.value-object';

describe('BlockSource', () => {
  it.each([
    {
      condition: 'no pack is given',
      expected: {
        kind: SourceKind.Release,
      },
      pack: undefined,
    },
    {
      condition: 'a pack is given',
      expected: {
        kind: SourceKind.Pack,
        pack: PackPath.create('./rules'),
      },
      pack: PackPath.create('./rules'),
    },
  ])('should name where a block is read from when $condition', ({ expected, pack }) => {
    // Arrange
    const path = pack;

    // Act
    const source = BlockSource.create(path);

    // Assert
    expect(source).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'both are the release',
      isEqual: true,
      left: BlockSource.create(),
      right: BlockSource.create(),
    },
    {
      condition: 'they are one pack written two ways',
      isEqual: true,
      left: BlockSource.create(PackPath.create('./rules')),
      right: BlockSource.create(PackPath.create('rules')),
    },
    {
      condition: 'they are two packs',
      isEqual: false,
      left: BlockSource.create(PackPath.create('rules')),
      right: BlockSource.create(PackPath.create('more')),
    },
    {
      condition: 'one is the release and one a pack',
      isEqual: false,
      left: BlockSource.create(),
      right: BlockSource.create(PackPath.create('rules')),
    },
    {
      condition: 'one is a pack and one the release',
      isEqual: false,
      left: BlockSource.create(PackPath.create('rules')),
      right: BlockSource.create(),
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const sources = [
      left,
      right,
    ] as const;

    // Act
    const isSame = BlockSource.equals(...sources);

    // Assert
    expect(isSame).toBe(isEqual);
  });

  it.each([
    {
      candidate: BlockSource.create(),
      condition: 'it is the release',
      isSource: true,
    },
    {
      candidate: BlockSource.create(PackPath.create('rules')),
      condition: 'it is a pack with its path',
      isSource: true,
    },
    {
      candidate: {
        kind: SourceKind.Pack,
        pack: '',
      },
      condition: 'it is a pack with an empty path',
      isSource: false,
    },
    {
      candidate: {
        kind: 'mirror',
        pack: 'rules',
      },
      condition: 'its kind is none, though it holds a path',
      isSource: false,
    },
    {
      candidate: undefined,
      condition: 'it is nothing',
      isSource: false,
    },
  ])('should say $isSource when $condition', ({ candidate, isSource }) => {
    // Arrange
    const given: unknown = candidate;

    // Act
    const answer = BlockSource.is(given);

    // Assert
    expect(answer).toBe(isSource);
  });
});
