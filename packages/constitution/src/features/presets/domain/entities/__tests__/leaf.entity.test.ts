import { describe, expect, it } from 'bun:test';

import { Leaf } from '../leaf.entity';
import type { Setting } from '../setting.entity';

interface LeafRow {
  readonly isItem: boolean;
  readonly keyPath: readonly string[];
  readonly value: Setting;
}

const cruiser: Setting = {
  forbidden: [
    {
      name: 'no-cycles',
      severity: 'error',
    },
    {
      name: 'alone',
    },
    {
      id: 7,
    },
    'loose',
  ],
  options: {
    tsConfig: 'tsconfig.json',
  },
};

describe('Leaf', () => {
  // The lock names each leaf by its key, so a key once released never changes.
  it.each<{
    key: string;
    leaf: LeafRow;
  }>([
    {
      key: '13h6p6w72uk',
      leaf: {
        isItem: false,
        keyPath: [
          'formatter',
          'lineWidth',
        ],
        value: 100,
      },
    },
    {
      key: '7u67o4x3rl',
      leaf: {
        isItem: true,
        keyPath: [
          'files',
          'includes',
        ],
        value: '**',
      },
    },
  ])('should name the leaf by the key $key', ({ key, leaf }) => {
    // Act
    const named = Leaf.keyOf(leaf);

    // Assert
    expect(named).toBe(key);
  });

  it.each<{
    condition: string;
    leaves: readonly LeafRow[];
    setting: Setting;
  }>([
    {
      condition: 'maps hold a scalar, a list and an addressed element',
      leaves: [
        {
          isItem: false,
          keyPath: [
            'forbidden[name=no-cycles]',
            'name',
          ],
          value: 'no-cycles',
        },
        {
          isItem: false,
          keyPath: [
            'forbidden[name=no-cycles]',
            'severity',
          ],
          value: 'error',
        },
        {
          isItem: true,
          keyPath: [
            'files',
          ],
          value: 'src',
        },
        {
          isItem: false,
          keyPath: [
            'depth',
          ],
          value: 3,
        },
      ],
      setting: {
        'forbidden[name=no-cycles]': {
          severity: 'error',
        },
        files: [
          'src',
        ],
        depth: 3,
      },
    },
    {
      condition: 'the setting is a list of lines',
      leaves: [
        {
          isItem: true,
          keyPath: [],
          value: 'dist/',
        },
      ],
      setting: [
        'dist/',
      ],
    },
    {
      condition: 'the setting is a scalar',
      leaves: [
        {
          isItem: false,
          keyPath: [],
          value: true,
        },
      ],
      setting: true,
    },
  ])('should give the leaves we write when $condition', ({ leaves, setting }) => {
    // Act
    const found = Leaf.leavesOf(setting);

    // Assert
    expect(found).toStrictEqual(leaves);
  });

  it('should give the leaves of a file, each element of a list also seen through the fields named, a field of no text aside', () => {
    // Act
    const found = Leaf.fileLeavesOf(cruiser, [
      'name',
      'id',
    ]);

    // Assert
    expect(found).toStrictEqual([
      {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: {
          name: 'no-cycles',
          severity: 'error',
        },
      },
      {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: {
          name: 'alone',
        },
      },
      {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: {
          id: 7,
        },
      },
      {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: 'loose',
      },
      {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'name',
        ],
        value: 'no-cycles',
      },
      {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'severity',
        ],
        value: 'error',
      },
      {
        isItem: false,
        keyPath: [
          'forbidden[name=alone]',
          'name',
        ],
        value: 'alone',
      },
      {
        isItem: false,
        keyPath: [
          'options',
          'tsConfig',
        ],
        value: 'tsconfig.json',
      },
    ]);
  });

  it.each<{
    condition: string;
    isHeld: boolean;
    leaf: LeafRow;
  }>([
    {
      condition: 'an addressed element holds the scalar',
      isHeld: true,
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'severity',
        ],
        value: 'error',
      },
    },
    {
      condition: 'the scalar differs',
      isHeld: false,
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'severity',
        ],
        value: 'warn',
      },
    },
    {
      condition: 'the list holds the item',
      isHeld: true,
      leaf: {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: 'loose',
      },
    },
    {
      condition: 'the list lacks the item',
      isHeld: false,
      leaf: {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: 'tight',
      },
    },
    {
      condition: 'the path holds no list for an item',
      isHeld: false,
      leaf: {
        isItem: true,
        keyPath: [
          'options',
        ],
        value: 'tsconfig.json',
      },
    },
  ])('should tell whether the setting holds the leaf when $condition', ({ isHeld, leaf }) => {
    // Act
    const holds = Leaf.isHeldBy(cruiser, leaf);

    // Assert
    expect(holds).toBe(isHeld);
  });

  it('should see no element through a field in a list held by a list', () => {
    // Act
    const found = Leaf.fileLeavesOf(
      {
        nested: [
          [
            'x',
          ],
        ],
      },
      [
        '0',
      ],
    );

    // Assert
    expect(found).toStrictEqual([
      {
        isItem: true,
        keyPath: [
          'nested',
        ],
        value: [
          'x',
        ],
      },
    ]);
  });

  it('should give the address fields the keys name, at every depth', () => {
    // Act
    const fields = Leaf.addressFieldsOf({
      'forbidden[name=no-cycles]': {
        'from[path=src]': {},
        level: 'error',
      },
      plain: {
        'jobs[run=x]': {},
      },
      width: 100,
    });

    // Assert
    expect([
      ...fields,
    ]).toStrictEqual([
      'name',
      'path',
      'run',
    ]);
  });

  it.each<{
    condition: string;
    leaf: LeafRow;
    left: Setting | undefined;
  }>([
    {
      condition: 'a scalar goes and its emptied map with it',
      leaf: {
        isItem: false,
        keyPath: [
          'options',
          'tsConfig',
        ],
        value: 'tsconfig.json',
      },
      left: {
        forbidden: [
          {
            name: 'no-cycles',
            severity: 'error',
          },
          {
            name: 'alone',
          },
          {
            id: 7,
          },
          'loose',
        ],
      },
    },
    {
      condition: 'an item goes from its list',
      leaf: {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: 'loose',
      },
      left: {
        forbidden: [
          {
            name: 'no-cycles',
            severity: 'error',
          },
          {
            name: 'alone',
          },
          {
            id: 7,
          },
        ],
        options: {
          tsConfig: 'tsconfig.json',
        },
      },
    },
    {
      condition: 'the last field but its address goes, and its element with it',
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'severity',
        ],
        value: 'error',
      },
      left: {
        forbidden: [
          {
            name: 'alone',
          },
          {
            id: 7,
          },
          'loose',
        ],
        options: {
          tsConfig: 'tsconfig.json',
        },
      },
    },
    {
      condition: 'the address of an element that holds nothing else goes',
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=alone]',
          'name',
        ],
        value: 'alone',
      },
      left: {
        forbidden: [
          {
            name: 'no-cycles',
            severity: 'error',
          },
          {
            id: 7,
          },
          'loose',
        ],
        options: {
          tsConfig: 'tsconfig.json',
        },
      },
    },
    {
      condition: 'the address of an element that holds more stays',
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'name',
        ],
        value: 'no-cycles',
      },
      left: undefined,
    },
    {
      condition: 'the scalar differs',
      leaf: {
        isItem: false,
        keyPath: [
          'options',
          'tsConfig',
        ],
        value: 'tsconfig.base.json',
      },
      left: undefined,
    },
    {
      condition: 'the list lacks the item',
      leaf: {
        isItem: true,
        keyPath: [
          'forbidden',
        ],
        value: 'tight',
      },
      left: undefined,
    },
    {
      condition: 'the path holds no list for an item',
      leaf: {
        isItem: true,
        keyPath: [
          'options',
          'tsConfig',
        ],
        value: 'x',
      },
      left: undefined,
    },
    {
      condition: 'a key passes through a scalar',
      leaf: {
        isItem: false,
        keyPath: [
          'options',
          'tsConfig',
          'more',
        ],
        value: 'x',
      },
      left: undefined,
    },
    {
      condition: 'a key would read a list by its index',
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden',
          '0',
        ],
        value: {
          name: 'no-cycles',
          severity: 'error',
        },
      },
      left: undefined,
    },
    {
      condition: 'an item would stand at an address field',
      leaf: {
        isItem: true,
        keyPath: [
          'forbidden[name=alone]',
          'name',
        ],
        value: 'alone',
      },
      left: undefined,
    },
    {
      condition: 'a path goes on below an address field',
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=alone]',
          'name',
          'deeper',
        ],
        value: 'alone',
      },
      left: undefined,
    },
    {
      condition: 'the key is absent',
      leaf: {
        isItem: false,
        keyPath: [
          'gone',
        ],
        value: 'x',
      },
      left: undefined,
    },
    {
      condition: 'the address names no element',
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=gone]',
          'severity',
        ],
        value: 'x',
      },
      left: undefined,
    },
    {
      condition: "an addressed element's leaf differs",
      leaf: {
        isItem: false,
        keyPath: [
          'forbidden[name=no-cycles]',
          'severity',
        ],
        value: 'warn',
      },
      left: undefined,
    },
  ])('should take a leaf out of a setting when $condition', ({ leaf, left }) => {
    // Act
    const without = Leaf.removedFrom(cruiser, leaf);

    // Assert
    expect(without).toStrictEqual(left);
  });

  it.each<{
    condition: string;
    leaf: LeafRow;
    left: Setting;
    setting: Setting;
  }>([
    {
      condition: "the list's last element goes, and the list with it",
      leaf: {
        isItem: false,
        keyPath: [
          'jobs[name=lint]',
          'run',
        ],
        value: 'biome check',
      },
      left: {},
      setting: {
        jobs: [
          {
            name: 'lint',
            run: 'biome check',
          },
        ],
      },
    },
    {
      condition: 'the last line of a file of lines goes',
      leaf: {
        isItem: true,
        keyPath: [],
        value: 'dist/',
      },
      left: [],
      setting: [
        'dist/',
      ],
    },
    {
      condition: 'a field of one element goes and the other elements stay',
      leaf: {
        isItem: false,
        keyPath: [
          'jobs[name=lint]',
          'run',
        ],
        value: 'biome check',
      },
      left: {
        jobs: [
          {
            glob: '*.ts',
            name: 'lint',
          },
          {
            name: 'fix',
            run: 'biome check --write',
          },
        ],
      },
      setting: {
        jobs: [
          {
            glob: '*.ts',
            name: 'lint',
            run: 'biome check',
          },
          {
            name: 'fix',
            run: 'biome check --write',
          },
        ],
      },
    },
  ])('should leave what stays when $condition', ({ leaf, left, setting }) => {
    // Act
    const without = Leaf.removedFrom(setting, leaf);

    // Assert
    expect(without).toStrictEqual(left);
  });

  it.each<{
    leaf: LeafRow;
    text: string;
  }>([
    {
      leaf: {
        isItem: false,
        keyPath: [
          'formatter',
          'lineWidth',
        ],
        value: 100,
      },
      text: 'formatter.lineWidth',
    },
    {
      leaf: {
        isItem: true,
        keyPath: [
          'files',
          'includes',
        ],
        value: '!!dist',
      },
      text: 'files.includes "!!dist"',
    },
    {
      leaf: {
        isItem: true,
        keyPath: [],
        value: 'dist/',
      },
      text: '"dist/"',
    },
  ])('should name the leaf in a report as $text', ({ leaf, text }) => {
    // Act
    const named = Leaf.textOf(leaf);

    // Assert
    expect(named).toBe(text);
  });
});
