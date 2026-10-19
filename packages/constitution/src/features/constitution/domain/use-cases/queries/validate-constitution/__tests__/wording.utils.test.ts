import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';

import { aBlock, blocksOf } from '../wording.utils';

// The wording the checks share is pinned here once, so their specs assert codes and names alone.
describe('aBlock', () => {
  it.each([
    {
      expected: 'a domain block',
      layer: Layer.Domain,
    },
    {
      expected: 'an implementation block',
      layer: Layer.Implementation,
    },
  ])('should name "$expected" when the layer is $layer', ({ expected, layer }) => {
    // Arrange
    const named = layer;

    // Act
    const wording = aBlock(named);

    // Assert
    expect(wording).toBe(expected);
  });
});

describe('blocksOf', () => {
  it.each<{
    expected: string;
    layers: Layer[];
    name: string;
  }>([
    {
      expected: '',
      layers: [],
      name: 'no layer is given',
    },
    {
      expected: 'domain blocks',
      layers: [
        Layer.Domain,
      ],
      name: 'one layer is given',
    },
    {
      expected: 'domain blocks or platform blocks',
      layers: [
        Layer.Domain,
        Layer.Platform,
      ],
      name: 'two layers are given',
    },
    {
      expected: 'domain blocks, platform blocks or language blocks',
      layers: [
        Layer.Domain,
        Layer.Platform,
        Layer.Language,
      ],
      name: 'three layers are given',
    },
  ])('should name "$expected" when $name', ({ expected, layers }) => {
    // Arrange
    const named = layers;

    // Act
    const wording = blocksOf(named);

    // Assert
    expect(wording).toBe(expected);
  });
});
