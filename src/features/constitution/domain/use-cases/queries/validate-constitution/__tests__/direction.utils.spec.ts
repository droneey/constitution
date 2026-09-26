import { describe, expect, it } from 'bun:test';

import type { Layer } from '#/kernel';

import { pairableBy, requirableBy } from '../direction.utils';

describe('requirableBy', () => {
  it.each([
    [
      'core',
      [],
    ],
    [
      'domain',
      [],
    ],
    [
      'platform',
      [
        'domain',
      ],
    ],
    [
      'language',
      [
        'domain',
      ],
    ],
    [
      'implementation',
      [
        'domain',
        'platform',
        'language',
        'implementation',
      ],
    ],
  ] as const)(
    'should allow only the layers above and implementation peers when a %s block requires',
    (layer: Layer, expected) => {
      // Arrange
      const subject = layer;

      // Act
      const layers = requirableBy(subject);

      // Assert
      expect(layers).toStrictEqual(expected);
    },
  );
});

describe('pairableBy', () => {
  it.each([
    [
      'core',
      [],
    ],
    [
      'domain',
      [
        'domain',
      ],
    ],
    [
      'platform',
      [
        'domain',
        'platform',
        'language',
      ],
    ],
    [
      'language',
      [
        'domain',
        'platform',
        'language',
      ],
    ],
    [
      'implementation',
      [
        'domain',
        'platform',
        'language',
        'implementation',
      ],
    ],
  ] as const)(
    'should allow its own layer and the layers above when a %s block pairs',
    (layer: Layer, expected) => {
      // Arrange
      const subject = layer;

      // Act
      const layers = pairableBy(subject);

      // Assert
      expect(layers).toStrictEqual(expected);
    },
  );
});
