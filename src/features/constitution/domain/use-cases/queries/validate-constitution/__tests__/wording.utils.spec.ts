import { describe, expect, it } from 'bun:test';

import type { Layer } from '#/kernel';

import { aBlock, blocksOf } from '../wording.utils';

describe('aBlock', () => {
  it.each([
    [
      'implementation',
      'an implementation block',
    ],
    [
      'domain',
      'a domain block',
    ],
  ] as const)(
    'should choose the article when the layer is %s',
    (layer: Layer, expected) => {
      // Arrange
      const subject = layer;

      // Act
      const phrase = aBlock(subject);

      // Assert
      expect(phrase).toBe(expected);
    },
  );
});

describe('blocksOf', () => {
  it.each([
    [
      [
        'domain',
      ],
      'domain blocks',
    ],
    [
      [
        'domain',
        'platform',
        'language',
      ],
      'domain blocks, platform blocks or language blocks',
    ],
  ] as const)(
    'should join the layers with "or" when given %p',
    (layers: readonly Layer[], expected) => {
      // Arrange
      const subject = layers;

      // Act
      const phrase = blocksOf(subject);

      // Assert
      expect(phrase).toBe(expected);
    },
  );
});
