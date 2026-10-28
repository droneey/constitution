import { describe, expect, it } from 'bun:test';

import { GOLD_BRAND_FILE } from '#/__tests__/theme.fixtures';

import { MalformedAccentError } from '../../errors';
import { AccentScale } from '../accent-scale.value-object';

const brandFileOf = (steps: Readonly<Record<string, unknown>>): unknown => ({
  color: {
    brand: steps,
  },
});

describe('AccentScale.create', () => {
  it.each<{
    readonly condition: string;
    readonly brandFile: unknown;
    readonly steps: readonly (readonly [
      string,
      string,
    ])[];
  }>([
    {
      condition: 'a step gives no sRGB colour',
      brandFile: GOLD_BRAND_FILE,
      steps: [
        [
          '300',
          '#e5bf6d',
        ],
        [
          '600',
          '#835c00',
        ],
      ],
    },
    {
      condition: 'a step is named like the prototype of every object',
      brandFile: JSON.parse('{"color": {"brand": {"__proto__": {"$value": {"hex": "#e5bf6d"}}}}}'),
      steps: [
        [
          '__proto__',
          '#e5bf6d',
        ],
      ],
    },
  ])(
    'should take each step by its sRGB colour, leaving out a step whose colour gives none, when $condition',
    ({ brandFile, steps }) => {
      // Act
      const scale = AccentScale.create(brandFile);

      // Assert
      expect<object>(Object.entries(scale)).toStrictEqual(steps);
    },
  );

  it.each<{
    readonly condition: string;
    readonly brandFile: unknown;
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
      condition: 'the scale is a list',
      brandFile: {
        color: {
          brand: [],
        },
      },
      paths: [
        'color.brand',
      ],
    },
    {
      condition: 'a step is left empty, as JSON can',
      brandFile: brandFileOf({
        '300': JSON.parse('null'),
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: 'a step is no token',
      brandFile: brandFileOf({
        '300': '#e5bf6d',
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: "a step's value is no colour",
      brandFile: brandFileOf({
        '300': {
          $value: '#e5bf6d',
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: "a colour's sRGB colour is no text, though it reads as one",
      brandFile: brandFileOf({
        '300': {
          $value: {
            hex: [
              '#e5bf6d',
            ],
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: "a colour's sRGB colour is a name",
      brandFile: brandFileOf({
        '300': {
          $value: {
            hex: 'red',
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: "a colour's sRGB colour follows other text",
      brandFile: brandFileOf({
        '300': {
          $value: {
            hex: 'rgb#e5bf6d',
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: "a colour's sRGB colour has a digit too many",
      brandFile: brandFileOf({
        '300': {
          $value: {
            hex: '#e5bf6d0',
          },
        },
      }),
      paths: [
        'color.brand.300',
      ],
    },
    {
      condition: 'two steps are malformed',
      brandFile: brandFileOf({
        '300': JSON.parse('null'),
        '600': {
          $value: {
            hex: '#835c00',
          },
        },
        '700': {
          $value: {
            hex: 'red',
          },
        },
      }),
      paths: [
        'color.brand.300',
        'color.brand.700',
      ],
    },
  ])('should refuse the brand file when $condition', ({ brandFile, paths }) => {
    // Act
    const creating = (): unknown => AccentScale.create(brandFile);

    // Assert
    expect(creating).toThrow(new MalformedAccentError(paths));
  });
});

describe('AccentScale.is', () => {
  it.each<{
    readonly condition: string;
    readonly candidate: unknown;
    readonly isScale: boolean;
  }>([
    {
      condition: 'each step holds an sRGB colour',
      candidate: {
        '300': '#e5bf6d',
        '600': '#835c00',
      },
      isScale: true,
    },
    {
      condition: 'one step holds no sRGB colour',
      candidate: {
        '300': '#e5bf6d',
        '600': 'red',
      },
      isScale: false,
    },
    {
      condition: 'it is no record',
      candidate: '#e5bf6d',
      isScale: false,
    },
  ])('should answer $isScale when $condition', ({ candidate, isScale }) => {
    // Act
    const answer = AccentScale.is(candidate);

    // Assert
    expect(answer).toBe(isScale);
  });
});
