import { describe, expect, it } from 'bun:test';

import type { Setting } from '../../../../../../entities';
import { Leaf } from '../../../../../../entities';
import type { Overlaid } from '../overlay-file.utils';
import { overlay } from '../overlay-file.utils';

const overlaidOf = (input: {
  file: Setting;
  locked?: readonly string[];
  ours: Setting;
}): Overlaid =>
  overlay({
    file: input.file,
    locked: new Set(input.locked ?? []),
    ours: input.ours,
    path: [],
  });

describe('overlay', () => {
  it('should write our lists and maps where the file holds nothing', () => {
    // Act
    const overlaid = overlaidOf({
      file: {},
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
      file: {
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
          path: [
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
      file: {
        width: 80,
      },
      locked: [
        Leaf.keyOf({
          isItem: false,
          path: [
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
