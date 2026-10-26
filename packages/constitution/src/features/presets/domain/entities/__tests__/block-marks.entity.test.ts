import { describe, expect, it } from 'bun:test';

import type { HeldStep } from '../block-marks.entity';
import { BlockMarks } from '../block-marks.entity';

const marked: BlockMarks = {
  blocks: [
    'biome',
    'git',
    'lefthook',
  ],
  marks: [
    {
      block: 'biome',
      path: [
        'jobs',
        {
          field: 'port',
          value: '80',
        },
      ],
    },
    {
      block: 'git',
      path: [
        'ignore',
        {
          item: 'dist/',
        },
      ],
    },
    {
      block: 'lefthook',
      path: [
        'parallel',
      ],
    },
  ],
};

describe('BlockMarks.blockAt', () => {
  it.each([
    {
      block: 'lefthook',
      condition: 'a key',
      path: [
        {
          key: 'parallel',
        },
      ],
    },
    {
      block: 'git',
      condition: 'an item by its value',
      path: [
        {
          key: 'ignore',
        },
        {
          item: 'dist/',
        },
      ],
    },
    {
      block: 'biome',
      condition: 'an element by the text of its field',
      path: [
        {
          key: 'jobs',
        },
        {
          item: {
            port: 80,
            run: 'lint',
          },
        },
      ],
    },
  ])('should name $block for $condition it marks', ({ block, path }) => {
    // Act
    const named = BlockMarks.blockAt(marked, path);

    // Assert
    expect(named).toBe(block);
  });

  it.each<{
    condition: string;
    path: readonly HeldStep[];
  }>([
    {
      condition: 'an item where a key is marked',
      path: [
        {
          item: 'parallel',
        },
      ],
    },
    {
      condition: 'a key where an item is marked',
      path: [
        {
          key: 'ignore',
        },
        {
          key: 'dist/',
        },
      ],
    },
    {
      condition: 'another item',
      path: [
        {
          key: 'ignore',
        },
        {
          item: 'build/',
        },
      ],
    },
    {
      condition: 'an element whose field holds a map',
      path: [
        {
          key: 'jobs',
        },
        {
          item: {
            port: {
              value: 80,
            },
          },
        },
      ],
    },
    {
      condition: 'an element whose field holds another text',
      path: [
        {
          key: 'jobs',
        },
        {
          item: {
            port: 8080,
          },
        },
      ],
    },
    {
      condition: 'a scalar where an element is marked',
      path: [
        {
          key: 'jobs',
        },
        {
          item: '80',
        },
      ],
    },
    {
      condition: 'the map holding a mark',
      path: [
        {
          key: 'ignore',
        },
      ],
    },
    {
      condition: 'a key inside a mark',
      path: [
        {
          key: 'parallel',
        },
        {
          key: 'level',
        },
      ],
    },
  ])('should name no block for $condition', ({ path }) => {
    // Act
    const named = BlockMarks.blockAt(marked, path);

    // Assert
    expect(named).toBeUndefined();
  });
});
