import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { BlockId, BlockSource, coreBlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import { EVERY } from '../../../../../../../domain/constants';
import type { Contribution, PresetEntry } from '../../../../../../../domain/entities';
import { PresetValue, ValueKind } from '../../../../../../../domain/entities';
import type { TargetFile } from '../../../../../../../domain/value-objects';
import { TargetKind } from '../../../../../../../domain/value-objects';
import { markBlocks } from '../mark-blocks';

const entryOf = (input: { file: string; reader: BlockId }): PresetEntry & TargetFile => ({
  block: coreBlockId,
  index: 0,
  kind: TargetKind.File,
  language: EVERY,
  rule: EVERY,
  set: {
    filePath: RepositoryRelativePath.create(`presets/${input.reader}/foundation.yaml`),
    placeInPresets: {
      axis: Axis.Foundation,
      reader: input.reader,
      withs: [],
    },
    source: BlockSource.create(undefined),
  },
  value: PresetValue.plain([]),
  writtenPath: input.file,
});

const from = (block: string, given: PresetValue): Contribution => ({
  block: BlockId.create(block),
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
            isWords: false,
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
        block: BlockId.create('lefthook'),
        keyPath: [
          'hooks',
          'parallel',
        ],
      },
      {
        block: BlockId.create('lefthook'),
        keyPath: [
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
        block: BlockId.create('biome'),
        keyPath: [
          'hooks',
          'jobs',
          {
            field: 'name',
            value: 'format',
          },
        ],
      },
      {
        block: BlockId.create('biome'),
        keyPath: [
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
        block: BlockId.create('biome'),
        keyPath: [
          'tools',
        ],
      },
      {
        block: BlockId.create('biome'),
        keyPath: [
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
            isWords: false,
            kind: ValueKind.Replace,
            setting: 2,
          }),
          pair('paths', {
            isWords: false,
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
        block: BlockId.create('cache'),
        keyPath: [
          'ignore',
          {
            item: '.cache/',
          },
        ],
      },
      {
        block: BlockId.create('ci'),
        keyPath: [
          'level',
        ],
      },
      {
        block: BlockId.create('ci'),
        keyPath: [
          'paths',
        ],
      },
      {
        block: BlockId.create('empty'),
        keyPath: [
          'empty',
        ],
      },
    ]);
  });

  it('should name every block that brings or keys an entry of the file, whatever the unit takes', () => {
    // Arrange
    const written = entryOf({
      file: '.gitignore',
      reader: BlockId.create('git'),
    });

    // Act
    const marks = markBlocks({
      contributions: [],
      entries: [
        written,
        entryOf({
          file: '.gitignore',
          reader: BlockId.create('vite'),
        }),
        entryOf({
          file: '.dockerignore',
          reader: BlockId.create('docker'),
        }),
        entryOf({
          file: '.gitignore',
          reader: BlockId.create('git'),
        }),
      ],
      merged: [],
      written: [
        written,
      ],
    });

    // Assert
    expect(marks?.blocks).toStrictEqual([
      BlockId.create('git'),
      BlockId.create('core'),
      BlockId.create('vite'),
    ]);
  });
});
