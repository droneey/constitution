import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import type { HeldStep } from '../block-marks.entity';
import { BlockMarks } from '../block-marks.entity';

const marked: BlockMarks = {
  blocks: [
    BlockId.create('biome'),
    BlockId.create('git'),
    BlockId.create('lefthook'),
    BlockId.create('nestjs'),
  ],
  marks: [
    {
      block: BlockId.create('biome'),
      keyPath: [
        'jobs',
        {
          field: 'port',
          value: '80',
        },
      ],
    },
    {
      block: BlockId.create('git'),
      keyPath: [
        'ignore',
        {
          item: 'dist/',
        },
      ],
    },
    {
      block: BlockId.create('lefthook'),
      keyPath: [
        'parallel',
      ],
    },
    {
      block: BlockId.create('nestjs'),
      keyPath: [
        'overrides',
        {
          item: {
            includes: [
              '**/*.controller.ts',
              {
                slot: 'injected-classes',
              },
            ],
          },
        },
      ],
    },
  ],
};

describe('BlockMarks.blockAt', () => {
  it.each([
    {
      block: BlockId.create('lefthook'),
      condition: 'a key',
      keyPath: [
        {
          key: 'parallel',
        },
      ],
    },
    {
      block: BlockId.create('git'),
      condition: 'an item by its value',
      keyPath: [
        {
          key: 'ignore',
        },
        {
          item: 'dist/',
        },
      ],
    },
    {
      block: BlockId.create('biome'),
      condition: 'an element by the text of its field',
      keyPath: [
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
    {
      block: BlockId.create('nestjs'),
      condition: 'an item by its value, its slot filled',
      keyPath: [
        {
          key: 'overrides',
        },
        {
          item: {
            includes: [
              '**/*.controller.ts',
              '**/*.adapter.ts',
            ],
          },
        },
      ],
    },
  ])('should name $block for $condition it marks', ({ block, keyPath }) => {
    // Act
    const named = BlockMarks.blockAt(marked, keyPath);

    // Assert
    expect(named).toBe(block);
  });

  it.each<{
    condition: string;
    keyPath: readonly HeldStep[];
  }>([
    {
      condition: 'an item where a key is marked',
      keyPath: [
        {
          item: 'parallel',
        },
      ],
    },
    {
      condition: 'a key where an item is marked',
      keyPath: [
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
      keyPath: [
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
      keyPath: [
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
      keyPath: [
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
      keyPath: [
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
      keyPath: [
        {
          key: 'ignore',
        },
      ],
    },
    {
      condition: 'a key inside a mark',
      keyPath: [
        {
          key: 'parallel',
        },
        {
          key: 'level',
        },
      ],
    },
  ])('should name no block for $condition', ({ keyPath }) => {
    // Act
    const named = BlockMarks.blockAt(marked, keyPath);

    // Assert
    expect(named).toBeUndefined();
  });
});
