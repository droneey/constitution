import { describe, expect, it } from 'bun:test';

import type { Leaf, Setting } from '../../../../../../entities';
import { defaultLeavesOf, writeDefaults } from '../write-defaults.utils';

const ignored: Leaf = {
  isItem: true,
  path: [
    'ignore',
  ],
  value: 'dist',
};

describe('defaultLeavesOf', () => {
  it("should take a whole list's lines only for a file of lines", () => {
    // Act
    const leaves = defaultLeavesOf({
      isLines: false,
      merged: {
        defaults: [],
        problems: [],
        whole: [
          'dist/',
        ],
      },
    });

    // Assert
    expect(leaves).toStrictEqual([]);
  });
});

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
      met: [],
      setting,
    });

    // Assert
    expect(defaults.setting).toStrictEqual(written);
  });
});
