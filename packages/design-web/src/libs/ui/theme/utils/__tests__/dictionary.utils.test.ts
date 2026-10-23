import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'bun:test';

import StyleDictionary from 'style-dictionary';

import type { ShadowLayer } from '../../types';
import { readTokens } from '../dictionary.utils';

/** a default scale, and a brand's over it: Style Dictionary takes the later file's */
const BASE = fileURLToPath(new URL('base.fixtures.tokens.json', import.meta.url));
const BRAND = fileURLToPath(new URL('brand.fixtures.tokens.json', import.meta.url));

const LAYER: ShadowLayer = {
  color: {
    alpha: 0.1,
    colorSpace: 'oklch',
    components: [
      0,
      0,
      0,
    ],
  },
  offsetX: {
    unit: 'px',
    value: 0,
  },
  offsetY: {
    unit: 'px',
    value: 4,
  },
  blur: {
    unit: 'px',
    value: 6,
  },
  spread: {
    unit: 'px',
    value: -4,
  },
};

describe('readTokens', () => {
  it('should keep a reference where the source writes one and resolve every other value', async () => {
    // Arrange
    const tokens = {
      dimension: {
        '8': {
          $value: {
            unit: 'px',
            value: 8,
          },
        },
      },
      spacing: {
        sm: {
          $value: '{dimension.8}',
        },
      },
      ease: {
        out: {
          $value: [
            0.23,
            1,
            0.32,
            1,
          ],
        },
      },
      color: {
        neutral: {
          '0': {
            $value: {
              colorSpace: 'oklch',
              components: [
                1,
                0,
                0,
              ],
            },
          },
        },
        overlay: {
          dim: {
            $value: {
              alpha: 0.5,
              colorSpace: 'oklch',
              components: [
                0,
                0,
                0,
              ],
              hex: '#000000',
            },
          },
        },
      },
      font: {
        weight: {
          normal: {
            $value: 400,
          },
        },
      },
    };

    // Act
    const read = await readTokens(
      {
        tokens,
      },
      StyleDictionary,
    );

    // Assert
    expect([
      ...read,
    ]).toStrictEqual([
      [
        'dimension.8',
        {
          $value: {
            unit: 'px',
            value: 8,
          },
        },
      ],
      [
        'spacing.sm',
        {
          $value: '{dimension.8}',
        },
      ],
      [
        'ease.out',
        {
          $value: [
            0.23,
            1,
            0.32,
            1,
          ],
        },
      ],
      [
        'color.neutral.0',
        {
          $value: {
            colorSpace: 'oklch',
            components: [
              1,
              0,
              0,
            ],
          },
        },
      ],
      [
        'color.overlay.dim',
        {
          $value: {
            alpha: 0.5,
            colorSpace: 'oklch',
            components: [
              0,
              0,
              0,
            ],
            hex: '#000000',
          },
        },
      ],
      [
        'font.weight.normal',
        {
          $value: 400,
        },
      ],
    ]);
  });

  it('should read a shadow as its layers', async () => {
    // Arrange
    const tokens = {
      shadow: {
        drop: {
          $value: [
            LAYER,
            LAYER,
          ],
        },
      },
    };

    // Act
    const read = await readTokens(
      {
        tokens,
      },
      StyleDictionary,
    );

    // Assert
    expect(read.get('shadow.drop')).toStrictEqual({
      $value: [
        LAYER,
        LAYER,
      ],
    });
  });

  it("should take a later file's scale over an earlier one's, as an app's brand overrides the default", async () => {
    // Arrange
    const source = [
      BASE,
      BRAND,
    ];

    // Act
    const read = await readTokens(
      {
        source,
      },
      StyleDictionary,
    );

    // Assert
    expect(read.get('color.brand.600')).toStrictEqual({
      $value: {
        colorSpace: 'oklch',
        components: [
          0.5,
          0.17,
          85,
        ],
        hex: '#835c00',
      },
    });
  });

  it.each([
    {
      colorSpace: 'srgb',
      components: [
        0.5,
        0.17,
        85,
      ],
    },
    {
      colorSpace: 'oklch',
      components: [
        0.5,
        0.17,
      ],
    },
    {
      colorSpace: 'oklch',
      components: [
        0.5,
        0.17,
        85,
        1,
      ],
    },
    {
      colorSpace: 'oklch',
      components: [
        0.5,
        '0.17',
        85,
      ],
    },
    {
      colorSpace: 'oklch',
      components: [
        0.5,
        0.17,
        85,
      ],
      hex: 8_346_880,
    },
    {
      alpha: '50%',
      colorSpace: 'oklch',
      components: [
        0.5,
        0.17,
        85,
      ],
    },
    {
      unit: 'px',
      value: '8',
    },
    {
      unit: 8,
      value: 8,
    },
    // a value a token file leaves empty, as JSON can
    JSON.parse('null'),
    true,
  ])('should refuse a token of no form the theme reads: %p', async (stray) => {
    // Arrange
    const tokens = {
      stray: {
        $value: stray,
      },
    };

    // Act
    const read = readTokens(
      {
        tokens,
      },
      StyleDictionary,
    );

    // Assert
    await expect(read).rejects.toThrow(new Error('stray holds a value of no form the theme reads'));
  });

  it.each([
    {
      name: 'a layer is no record',
      shadow: [
        'a layer',
      ],
    },
    {
      name: 'a layer names its colour',
      shadow: [
        {
          ...LAYER,
          color: 'black',
        },
      ],
    },
    {
      name: 'a layer holds a bare offsetX',
      shadow: [
        {
          ...LAYER,
          offsetX: 0,
        },
      ],
    },
    {
      name: 'a layer holds a bare offsetY',
      shadow: [
        {
          ...LAYER,
          offsetY: 4,
        },
      ],
    },
    {
      name: 'a layer holds a bare blur',
      shadow: [
        {
          ...LAYER,
          blur: 6,
        },
      ],
    },
    {
      name: 'a layer holds a bare spread',
      shadow: [
        {
          ...LAYER,
          spread: -4,
        },
      ],
    },
    {
      name: 'one layer of two is unreadable',
      shadow: [
        LAYER,
        {
          ...LAYER,
          spread: '-4px',
        },
      ],
    },
  ])('should refuse a shadow when $name', async ({ shadow }) => {
    // Arrange
    const tokens = {
      stray: {
        $value: shadow,
      },
    };

    // Act
    const read = readTokens(
      {
        tokens,
      },
      StyleDictionary,
    );

    // Assert
    await expect(read).rejects.toThrow(new Error('stray holds a value of no form the theme reads'));
  });
});
