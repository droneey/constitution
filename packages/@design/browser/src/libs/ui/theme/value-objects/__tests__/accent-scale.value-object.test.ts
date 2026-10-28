import { describe, expect, it } from 'bun:test';

import { createBrandFile } from '#/__tests__/brand.fixtures';

import { MalformedAccentError } from '../../errors';
import { AccentScale } from '../accent-scale.value-object';

const refusalOf = (brandFile: unknown): unknown => {
  try {
    AccentScale.create(brandFile);
  } catch (error) {
    if (!(error instanceof MalformedAccentError)) {
      throw error;
    }

    return {
      code: error.code,
      paths: error.paths,
    };
  }

  return undefined;
};

describe('AccentScale', () => {
  it("should take each step by its colour, past the group's own properties", () => {
    // Act
    const scale = AccentScale.create(createBrandFile());

    // Assert
    expect<object>(scale).toStrictEqual({
      '300': [
        0.82,
        0.11,
        85,
      ],
      '600': [
        0.5,
        0.17,
        85,
      ],
    });
  });

  it.each<{
    readonly brandFile: unknown;
    readonly condition: string;
    readonly paths: readonly string[];
  }>([
    {
      condition: 'the file is empty, as JSON can be',
      brandFile: JSON.parse('null'),
      paths: [
        'color.brand',
      ],
    },
    {
      condition: 'the file holds no colours',
      brandFile: {},
      paths: [
        'color.brand',
      ],
    },
    {
      condition: 'the colours hold no scale',
      brandFile: {
        color: {},
      },
      paths: [
        'color.brand',
      ],
    },
    {
      condition: 'the scale holds no step',
      brandFile: {
        color: {
          brand: {
            $type: 'color',
          },
        },
      },
      paths: [
        'color.brand',
      ],
    },
    {
      condition:
        'a step is named otherwise than a token, as a closing brace would break out of the stylesheet',
      brandFile: createBrandFile({
        '300 } body {': {
          $value: {
            colorSpace: 'oklch',
            components: [
              0.82,
              0.11,
              85,
            ],
          },
        },
      }),
      paths: [
        'color.brand.300 } body {',
      ],
    },
    {
      condition: 'a step is left empty, as JSON can',
      brandFile: createBrandFile({
        '300': JSON.parse('null'),
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: 'a step holds a value that is no colour',
      brandFile: createBrandFile({
        '300': {
          $value: 'oklch(0.82 0.11 85)',
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: 'a step holds a colour of another space',
      brandFile: createBrandFile({
        '300': {
          $value: {
            colorSpace: 'srgb',
            components: [
              0.9,
              0.75,
              0.43,
            ],
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: 'a step holds a colour whose component is no number',
      brandFile: createBrandFile({
        '300': {
          $value: {
            colorSpace: 'oklch',
            components: [
              0.94,
              '0.043',
              85,
            ],
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: 'a step holds a colour of two components',
      brandFile: createBrandFile({
        '300': {
          $value: {
            colorSpace: 'oklch',
            components: [
              0.94,
              0.043,
            ],
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
  ])(
    'should refuse the file, naming each place at fault, when $condition',
    ({ brandFile, paths }) => {
      // Act
      const refusal = refusalOf(brandFile);

      // Assert
      expect(refusal).toStrictEqual({
        code: 'malformed-accent',
        paths,
      });
    },
  );

  it.each<{
    readonly candidate: unknown;
    readonly condition: string;
    readonly isScale: boolean;
  }>([
    {
      condition: 'a list, which is no record',
      candidate: [],
      isScale: false,
    },
    {
      condition: 'a record of no step',
      candidate: {},
      isScale: false,
    },
    {
      condition: 'a record with a step named otherwise than a token',
      candidate: {
        brandDark: [
          0.82,
          0.11,
          85,
        ],
      },
      isScale: false,
    },
    {
      condition: 'a record with a step that is no colour in OKLCH',
      candidate: {
        '300': [
          0.82,
          0.11,
        ],
      },
      isScale: false,
    },
    {
      condition: 'a record of colours in OKLCH, a step named in segments',
      candidate: {
        'solid-600': [
          0.82,
          0.11,
          85,
        ],
      },
      isScale: true,
    },
  ])('should tell an accent scale apart when given $condition', ({ candidate, isScale }) => {
    // Act
    const verdict = AccentScale.is(candidate);

    // Assert
    expect(verdict).toBe(isScale);
  });
});
