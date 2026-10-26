import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { BlockSource } from '#/kernel/value-objects';

import type { Contribution, PresetEntry } from '../../../../../../entities';
import { PresetValue, ValueKind } from '../../../../../../entities';
import { TargetFile } from '../../../../../../value-objects';
import { markBlocks } from '../mark-blocks.utils';

const entryOf = (input: { file: string; reader: string }): PresetEntry => ({
  block: 'core',
  file: TargetFile.of(input.file),
  index: 0,
  language: '*',
  rule: '*',
  set: {
    file: `presets/${input.reader}/foundation.yaml`,
    path: {
      axis: Axis.Foundation,
      reader: input.reader,
      withs: [],
    },
    source: BlockSource.create(undefined),
  },
  value: PresetValue.plain([]),
});

const from = (block: string, given: PresetValue): Contribution => ({
  block,
  source: block,
  value: given,
});

const pair = (key: string, given: PresetValue) => ({
  key,
  value: given,
});

describe('markBlocks', () => {
  it('should mark each key or item one block alone gives below what several fill, the first to give a value owning it', () => {
    // Arrange
    const contributions = [
      from(
        'lefthook',
        PresetValue.mapOf([
          pair(
            'hooks',
            PresetValue.mapOf([
              pair('parallel', PresetValue.plain(true)),
              pair(
                'jobs[name=lint]',
                PresetValue.mapOf([
                  pair('run', PresetValue.plain('lint')),
                ]),
              ),
            ]),
          ),
        ]),
      ),
      from(
        'biome',
        PresetValue.mapOf([
          pair(
            'hooks',
            PresetValue.mapOf([
              pair('parallel', PresetValue.plain(true)),
              pair(
                'jobs[name=format]',
                PresetValue.mapOf([
                  pair('run', PresetValue.plain('format')),
                ]),
              ),
              pair(
                'jobs[name=lint]',
                PresetValue.mapOf([
                  pair('fixed', PresetValue.plain(true)),
                ]),
              ),
            ]),
          ),
          pair('tools', PresetValue.mapOf([])),
          pair(
            'words',
            PresetValue.wordsOf([
              'biome',
              'check',
            ]),
          ),
          pair('gone', PresetValue.plain('mine')),
        ]),
      ),
      from(
        'starter',
        PresetValue.mapOf([
          pair('notes', {
            kind: ValueKind.Default,
            setting: 'kept',
          }),
        ]),
      ),
    ];

    // Act
    const marks = markBlocks({
      contributions,
      entries: [],
      merged: {
        hooks: {
          'jobs[name=format]': {
            run: 'format',
          },
          'jobs[name=lint]': {
            fixed: true,
            run: 'lint',
          },
          parallel: true,
        },
        notes: 'kept',
        tools: {},
        words: 'biome check',
      },
      written: [],
    });

    // Assert
    expect(marks?.marks).toStrictEqual([
      {
        block: 'lefthook',
        path: [
          'hooks',
          'parallel',
        ],
      },
      {
        block: 'lefthook',
        path: [
          'hooks',
          'jobs',
          {
            field: 'name',
            value: 'lint',
          },
          'run',
        ],
      },
      {
        block: 'biome',
        path: [
          'hooks',
          'jobs',
          {
            field: 'name',
            value: 'format',
          },
        ],
      },
      {
        block: 'biome',
        path: [
          'hooks',
          'jobs',
          {
            field: 'name',
            value: 'lint',
          },
          'fixed',
        ],
      },
      {
        block: 'biome',
        path: [
          'tools',
        ],
      },
      {
        block: 'biome',
        path: [
          'words',
        ],
      },
    ]);
  });

  it('should mark what the file keeps by the block that gives it, a replacer and an inserter among them', () => {
    // Arrange
    const contributions = [
      from(
        'git',
        PresetValue.mapOf([
          pair(
            'ignore',
            PresetValue.plain([
              {
                slot: 'tools',
              },
            ]),
          ),
          pair('level', PresetValue.plain(1)),
          pair(
            'paths',
            PresetValue.plain([
              'src',
            ]),
          ),
        ]),
      ),
      from(
        'cache',
        PresetValue.mapOf([
          pair(
            'ignore@tools',
            PresetValue.plain([
              '.cache/',
            ]),
          ),
        ]),
      ),
      from(
        'ci',
        PresetValue.mapOf([
          pair('level', {
            kind: ValueKind.Replace,
            setting: 2,
          }),
          pair('paths', {
            kind: ValueKind.Replace,
            setting: 'all',
          }),
        ]),
      ),
      from(
        'empty',
        PresetValue.mapOf([
          pair('empty', PresetValue.plain([])),
        ]),
      ),
    ];

    // Act
    const marks = markBlocks({
      contributions,
      entries: [],
      merged: {
        empty: [],
        ignore: [
          '.cache/',
        ],
        level: 2,
        paths: 'all',
      },
      written: [],
    });

    // Assert
    expect(marks?.marks).toStrictEqual([
      {
        block: 'cache',
        path: [
          'ignore',
          {
            item: '.cache/',
          },
        ],
      },
      {
        block: 'ci',
        path: [
          'level',
        ],
      },
      {
        block: 'ci',
        path: [
          'paths',
        ],
      },
      {
        block: 'empty',
        path: [
          'empty',
        ],
      },
    ]);
  });

  it('should name every block an entry of the file brings, whatever the unit takes', () => {
    // Arrange
    const written = entryOf({
      file: '.gitignore',
      reader: 'git',
    });

    // Act
    const marks = markBlocks({
      contributions: [],
      entries: [
        written,
        entryOf({
          file: '.gitignore',
          reader: 'vite',
        }),
        entryOf({
          file: '.dockerignore',
          reader: 'docker',
        }),
        entryOf({
          file: '.gitignore',
          reader: 'git',
        }),
      ],
      merged: [],
      written: [
        written,
      ],
    });

    // Assert
    expect(marks?.blocks).toStrictEqual([
      'git',
      'vite',
    ]);
  });

  it('should mark nothing where the entries write only defaults', () => {
    // Act
    const marks = markBlocks({
      contributions: [],
      entries: [],
      merged: undefined,
      written: [],
    });

    // Assert
    expect(marks).toBeUndefined();
  });
});
