import { describe, expect, it } from 'bun:test';

import type { Setting } from '../setting.entity';
import { Setting as Settings } from '../setting.entity';

const rules: Setting = {
  forbidden: [
    'loose',
    {
      name: 'no-cycles',
      severity: 'error',
    },
    {
      id: 7,
      name: 'by-number',
    },
  ],
  options: {
    depth: 3,
  },
};

describe('Setting', () => {
  it.each<{
    condition: string;
    held: Setting | undefined;
    path: readonly string[];
  }>([
    {
      condition: 'the path is empty',
      held: rules,
      path: [],
    },
    {
      condition: 'keys lead to it',
      held: 3,
      path: [
        'options',
        'depth',
      ],
    },
    {
      condition: 'an address names a field only a text of the list holds',
      held: undefined,
      path: [
        'forbidden[length=5]',
      ],
    },
    {
      condition: 'an address names an element',
      held: 'error',
      path: [
        'forbidden[name=no-cycles]',
        'severity',
      ],
    },
    {
      condition: 'an address names a number as its text',
      held: 'by-number',
      path: [
        'forbidden[id=7]',
        'name',
      ],
    },
    {
      condition: 'an address names no element',
      held: undefined,
      path: [
        'forbidden[name=gone]',
      ],
    },
    {
      condition: 'an address names no list',
      held: undefined,
      path: [
        'options[name=depth]',
      ],
    },
    {
      condition: 'a key passes through a scalar',
      held: undefined,
      path: [
        'options',
        'depth',
        'more',
      ],
    },
  ])('should give what a path holds when $condition', ({ held, path }) => {
    // Act
    const found = Settings.at(rules, path);

    // Assert
    expect(found).toStrictEqual(held);
  });

  it.each<{
    condition: string;
    path: readonly string[];
    placed: Setting;
    setting: Setting | undefined;
    written: Setting;
  }>([
    {
      condition: 'the path is empty',
      path: [],
      setting: {
        kept: true,
      },
      placed: 1,
      written: 1,
    },
    {
      condition: 'its maps are absent, or a scalar stands in their place',
      path: [
        'a',
        'b',
      ],
      setting: {
        a: 'scalar',
        kept: true,
      },
      placed: 1,
      written: {
        a: {
          b: 1,
        },
        kept: true,
      },
    },
    {
      condition: 'an address names an element that a map is laid into',
      path: [
        'forbidden[name=no-cycles]',
      ],
      setting: rules,
      placed: {
        severity: 'warn',
      },
      written: {
        forbidden: [
          'loose',
          {
            name: 'no-cycles',
            severity: 'warn',
          },
          {
            id: 7,
            name: 'by-number',
          },
        ],
        options: {
          depth: 3,
        },
      },
    },
    {
      condition: 'an address names an element no list holds, below which the path goes on',
      path: [
        'jobs[name=lint]',
        'run',
      ],
      setting: {
        jobs: 'scalar',
      },
      placed: 'biome check',
      written: {
        jobs: [
          {
            name: 'lint',
            run: 'biome check',
          },
        ],
      },
    },
    {
      condition: 'a map is placed below an addressed element',
      path: [
        'jobs[name=lint]',
        'options',
      ],
      setting: {
        jobs: [
          {
            name: 'lint',
          },
        ],
      },
      placed: {
        level: 1,
      },
      written: {
        jobs: [
          {
            name: 'lint',
            options: {
              level: 1,
            },
          },
        ],
      },
    },
    {
      condition: 'an address names a new element of a list',
      path: [
        'jobs[name=fix]',
      ],
      setting: {
        jobs: [
          {
            name: 'lint',
          },
        ],
      },
      placed: 'all',
      written: {
        jobs: [
          {
            name: 'lint',
          },
          'all',
        ],
      },
    },
  ])('should write a value at a path when $condition', ({ path, placed, setting, written }) => {
    // Act
    const withValue = Settings.withAt({
      path,
      setting,
      value: placed,
    });

    // Assert
    expect(withValue).toStrictEqual(written);
  });

  it('should write a setting as one text whatever the order of its keys', () => {
    // Act
    const texts = [
      Settings.canonicalTextOf({
        a: [
          1,
          'x',
          true,
          {
            f: 1,
            e: 2,
          },
        ],
        b: {
          d: 1,
          c: 2,
        },
      }),
      Settings.canonicalTextOf({
        b: {
          c: 2,
          d: 1,
        },
        a: [
          1,
          'x',
          true,
          {
            e: 2,
            f: 1,
          },
        ],
      }),
    ];

    // Assert
    expect(texts).toStrictEqual([
      '{"a":[1,"x",true,{"e":2,"f":1}],"b":{"c":2,"d":1}}',
      '{"a":[1,"x",true,{"e":2,"f":1}],"b":{"c":2,"d":1}}',
    ]);
  });

  it.each<{
    condition: string;
    isScalar: boolean;
    setting: Setting | undefined;
  }>([
    {
      condition: 'it is a text',
      isScalar: true,
      setting: '',
    },
    {
      condition: 'it is false',
      isScalar: true,
      setting: false,
    },
    {
      condition: 'it is absent',
      isScalar: false,
      setting: undefined,
    },
    {
      condition: 'it is a list',
      isScalar: false,
      setting: [],
    },
  ])('should tell a scalar when $condition', ({ isScalar, setting }) => {
    // Act
    const isOne = Settings.isScalar(setting);

    // Assert
    expect(isOne).toBe(isScalar);
  });
});
