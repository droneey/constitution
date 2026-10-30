import { describe, expect, it } from 'bun:test';

import type { Leaf, Setting, WholeDefault } from '../../../../../../../entities';
import { WholeKind } from '../../../../../../../entities';
import { defaultLeavesOf, writeDefaults } from '../write-defaults';

const ignored: Leaf = {
  isItem: true,
  keyPath: [
    'ignore',
  ],
  value: 'dist',
};

describe('writeDefaults', () => {
  it.each<{
    condition: string;
    setting: Setting;
    written: Setting;
  }>([
    {
      condition: 'the path holds nothing',
      setting: {},
      written: {
        ignore: [
          'dist',
        ],
      },
    },
    {
      condition: 'the path holds a scalar of the file’s own',
      setting: {
        ignore: 'build',
      },
      written: {
        ignore: 'build',
      },
    },
  ])('should add a default item to its list when $condition', ({ setting, written }) => {
    // Act
    const defaults = writeDefaults({
      leaves: [
        ignored,
      ],
      metBefore: [],
      setting,
    });

    // Assert
    expect(defaults.setting).toStrictEqual(written);
  });
});

describe('defaultLeavesOf', () => {
  it.each<{
    condition: string;
    isLines: boolean;
    leaves: Leaf[];
    whole: WholeDefault;
  }>([
    {
      condition: 'a file of lines takes lines',
      isLines: true,
      leaves: [
        {
          isItem: true,
          keyPath: [],
          value: 'dist/',
        },
      ],
      whole: {
        kind: WholeKind.Added,
        setting: [
          'dist/',
        ],
      },
    },
    {
      condition: 'a file of settings takes lines',
      isLines: false,
      leaves: [],
      whole: {
        kind: WholeKind.Added,
        setting: [
          'dist/',
        ],
      },
    },
    {
      condition: 'a file takes keys',
      isLines: false,
      leaves: [
        {
          isItem: false,
          keyPath: [
            'width',
          ],
          value: 100,
        },
      ],
      whole: {
        kind: WholeKind.Added,
        setting: {
          width: 100,
        },
      },
    },
    {
      condition: 'a file is a text',
      isLines: true,
      leaves: [],
      whole: {
        kind: WholeKind.Text,
        text: 'dist/\n',
      },
    },
  ])(
    "should give the leaves of a whole file's default when $condition",
    ({ isLines, leaves, whole }) => {
      // Act
      const given = defaultLeavesOf({
        isLines,
        merged: {
          defaults: [],
          problems: [],
          whole,
        },
      });

      // Assert
      expect(given).toStrictEqual(leaves);
    },
  );
});
