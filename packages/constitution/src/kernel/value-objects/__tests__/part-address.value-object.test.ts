import { describe, expect, it } from 'bun:test';

import { Axis } from '../../constants';
import { InvalidValueError, ValueFailure } from '../../errors';
import { PartAddress } from '../part-address.value-object';

const coreOfBiome = PartAddress.create({
  axis: Axis.Foundation,
  name: 'core',
  scope: 'typescript',
  tool: 'biome',
});

describe('PartAddress', () => {
  it.each([
    {
      condition: 'they name one part',
      isEqual: true,
      other: coreOfBiome,
    },
    {
      condition: 'their axes differ',
      isEqual: false,
      other: PartAddress.create({
        axis: Axis.Architecture,
        name: 'core',
        scope: 'typescript',
        tool: 'biome',
      }),
    },
    {
      condition: 'their names differ',
      isEqual: false,
      other: PartAddress.create({
        axis: Axis.Foundation,
        name: 'self',
        scope: 'typescript',
        tool: 'biome',
      }),
    },
    {
      condition: 'their scopes differ',
      isEqual: false,
      other: PartAddress.create({
        axis: Axis.Foundation,
        name: 'core',
        scope: 'common',
        tool: 'biome',
      }),
    },
    {
      condition: 'their tools differ',
      isEqual: false,
      other: PartAddress.create({
        axis: Axis.Foundation,
        name: 'core',
        scope: 'typescript',
        tool: 'knip',
      }),
    },
  ])('should say $isEqual when $condition', ({ isEqual, other }) => {
    // Arrange
    const address = coreOfBiome;

    // Act
    const isSame = PartAddress.equals(address, other);

    // Assert
    expect(isSame).toBe(isEqual);
  });

  it('should name the part by its scope, axis and name when a configuration names it', () => {
    // Arrange
    const address = coreOfBiome;

    // Act
    const short = PartAddress.shortOf(address);

    // Assert
    expect(short).toBe('typescript/foundation/core');
  });

  it.each([
    {
      condition: 'its scope is empty',
      input: {
        ...coreOfBiome,
        scope: '',
      },
      text: '/biome/foundation/core',
    },
    {
      condition: 'its tool holds a "/"',
      input: {
        ...coreOfBiome,
        tool: 'bio/me',
      },
      text: 'typescript/bio/me/foundation/core',
    },
    {
      condition: 'its name is empty',
      input: {
        ...coreOfBiome,
        name: '',
      },
      text: 'typescript/biome/foundation/',
    },
  ])('should refuse an address when $condition', ({ input, text }) => {
    // Act
    const create = (): PartAddress => PartAddress.create(input);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.PartAddress,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      candidate: {
        ...coreOfBiome,
      },
      condition: 'it names a part',
      isAddress: true,
    },
    {
      candidate: {
        ...coreOfBiome,
        axis: 'sideways',
      },
      condition: 'its axis is none',
      isAddress: false,
    },
    {
      candidate: {
        ...coreOfBiome,
        name: 'co/re',
      },
      condition: 'its name holds a "/"',
      isAddress: false,
    },
    {
      candidate: {
        ...coreOfBiome,
        scope: '',
      },
      condition: 'its scope is empty',
      isAddress: false,
    },
    {
      candidate: {
        ...coreOfBiome,
        tool: '',
      },
      condition: 'its tool is empty',
      isAddress: false,
    },
    {
      candidate: {
        ...coreOfBiome,
        tool: 7,
      },
      condition: 'its tool is no text',
      isAddress: false,
    },
    {
      candidate: undefined,
      condition: 'it is nothing',
      isAddress: false,
    },
  ])('should say $isAddress when $condition', ({ candidate, isAddress }) => {
    // Act
    const answer = PartAddress.is(candidate);

    // Assert
    expect(answer).toBe(isAddress);
  });
});
