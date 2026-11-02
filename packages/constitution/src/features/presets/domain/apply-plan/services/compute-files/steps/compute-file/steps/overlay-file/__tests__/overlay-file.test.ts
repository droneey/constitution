import { describe, expect, it } from 'bun:test';

import type { Setting } from '../../../../../../../../setting/entities';
import { Leaf } from '../../../../../../../../setting/entities';
import type { Overlaid } from '../overlay-file';
import { overlayFile } from '../overlay-file';

const overlaidOf = (input: {
  fileSetting: Setting;
  locked?: readonly string[];
  ours: Setting;
}): Overlaid =>
  overlayFile({
    fileSetting: input.fileSetting,
    locked: new Set(input.locked ?? []),
    ours: input.ours,
    keyPath: [],
  });

describe('overlayFile', () => {
  it('should keep what the file holds in the place of a list or a map of ours, and name each a loosening', () => {
    // Act
    const overlaid = overlaidOf({
      fileSetting: {
        files: 'all',
        formatter: 'off',
      },
      ours: {
        files: [
          '**',
        ],
        formatter: {
          width: 100,
        },
      },
    });

    // Assert
    expect(overlaid).toStrictEqual({
      loosenings: [
        {
          keyPath: [
            'files',
          ],
          wanted: [
            '**',
          ],
        },
        {
          keyPath: [
            'formatter',
          ],
          wanted: {
            width: 100,
          },
        },
      ],
      value: {
        files: 'all',
        formatter: 'off',
      },
    });
  });

  it('should write our lists and maps where the file holds nothing', () => {
    // Act
    const overlaid = overlaidOf({
      fileSetting: {},
      ours: {
        files: [
          '**',
        ],
        formatter: {
          width: 100,
        },
      },
    });

    // Assert
    expect(overlaid).toStrictEqual({
      loosenings: [],
      value: {
        files: [
          '**',
        ],
        formatter: {
          width: 100,
        },
      },
    });
  });

  it("should lay our settings into the element we address, keep the list's other items, and name a loosening by its full path", () => {
    // Act
    const overlaid = overlaidOf({
      fileSetting: {
        rules: [
          'own',
          {
            level: 'warn',
            name: 'size',
          },
        ],
      },
      ours: {
        'rules[name=size]': {
          level: 'error',
          max: 500,
        },
      },
    });

    // Assert
    expect(overlaid).toStrictEqual({
      loosenings: [
        {
          keyPath: [
            'rules[name=size]',
            'level',
          ],
          wanted: 'error',
        },
      ],
      value: {
        rules: [
          {
            level: 'warn',
            max: 500,
            name: 'size',
          },
          'own',
        ],
      },
    });
  });

  it('should take a value the lock says is ours from before as ours, and replace it', () => {
    // Act
    const overlaid = overlaidOf({
      fileSetting: {
        width: 80,
      },
      locked: [
        Leaf.keyOf({
          isItem: false,
          keyPath: [
            'width',
          ],
          value: 80,
        }),
      ],
      ours: {
        width: 100,
      },
    });

    // Assert
    expect(overlaid).toStrictEqual({
      loosenings: [],
      value: {
        width: 100,
      },
    });
  });
});
