import { describe, expect, it } from 'bun:test';

import { hexToLinearSrgb, mixLinearSrgb, oklchToLinearSrgb } from '../colour.utils';

describe('oklchToLinearSrgb', () => {
  it.each([
    {
      name: 'the colour is white',
      oklch: [
        1,
        0,
        0,
      ],
      expected: [
        1,
        1,
        1,
      ],
    },
    {
      name: 'the colour is black',
      oklch: [
        0,
        0,
        0,
      ],
      expected: [
        0,
        0,
        0,
      ],
    },
    {
      name: 'the colour is a grey of half the lightness, whose cones respond to its cube',
      oklch: [
        0.5,
        0,
        0,
      ],
      expected: [
        0.125,
        0.125,
        0.125,
      ],
    },
    {
      name: 'the colour is sRGB red, its blue just below the gamut',
      oklch: [
        0.627_955,
        0.257_683,
        29.2339,
      ],
      expected: [
        0.999_997_724_034_088_7,
        1.934_151_654_114_924e-7,
        0,
      ],
    },
    {
      name: 'the colour is a green beyond the gamut, its red and blue below zero',
      oklch: [
        0.6,
        0.3,
        150,
      ],
      expected: [
        0,
        0.400_275_519_025_252_7,
        0,
      ],
    },
    {
      name: 'the colour is a blue beyond the gamut, its blue above one',
      oklch: [
        0.7,
        0.2,
        260,
      ],
      expected: [
        0.074_861_822_290_315_8,
        0.320_949_304_486_183_64,
        1,
      ],
    },
  ] as const)('should return $expected when $name', ({ oklch, expected }) => {
    // Arrange
    const colour = oklch;

    // Act
    const linear = oklchToLinearSrgb(colour);

    // Assert
    expect(linear).toStrictEqual(expected);
  });
});

describe('hexToLinearSrgb', () => {
  it.each([
    {
      name: 'the colour is white',
      hex: '#ffffff',
      expected: [
        1,
        1,
        1,
      ],
    },
    {
      name: 'the colour is black',
      hex: '#000000',
      expected: [
        0,
        0,
        0,
      ],
    },
    {
      name: 'each channel differs, the green on the curve of the transfer',
      hex: '#ff8000',
      expected: [
        1,
        0.215_860_500_113_899_26,
        0,
      ],
    },
    {
      name: 'the channels are dark enough for the linear part of the transfer',
      hex: '#0a0a0a',
      expected: [
        0.003_035_269_835_488_375,
        0.003_035_269_835_488_375,
        0.003_035_269_835_488_375,
      ],
    },
    {
      name: 'the digits are upper-case',
      hex: '#FF8000',
      expected: [
        1,
        0.215_860_500_113_899_26,
        0,
      ],
    },
  ])('should return $expected when $name', ({ hex, expected }) => {
    // Arrange
    const written = hex;

    // Act
    const linear = hexToLinearSrgb(written);

    // Assert
    expect(linear).toStrictEqual(expected);
  });
});

describe('mixLinearSrgb', () => {
  it('should weigh each channel by the share of the colour over the one under it', () => {
    // Arrange
    const over = [
      1,
      0.5,
      0,
    ] as const;
    const under = [
      0,
      0.5,
      1,
    ] as const;

    // Act
    const mixed = mixLinearSrgb(over, under, 0.25);

    // Assert
    expect(mixed).toStrictEqual([
      0.25,
      0.5,
      0.75,
    ]);
  });
});
