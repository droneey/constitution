import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';
import type { BlockModel } from '#/kernel/entities';
import { TermKind } from '#/kernel/entities';
import { BlockId, Glob } from '#/kernel/value-objects';

import { RoleNames } from '../role-names.value-object';

const blockOf = (input: { governs?: readonly string[]; id: string; layer: Layer }) => ({
  governs: (input.governs ?? []).map(Glob.create),
  id: BlockId.create(input.id),
  isAbstract: false,
  languages: [],
  layer: input.layer,
  requires: [],
});

const roleOf = (input: {
  block: string;
  id?: string;
  kind: TermKind.Folder | TermKind.Suffix;
  term: string;
}) => ({
  axis: Axis.Foundation,
  block: BlockId.create(input.block),
  ...(input.id === undefined
    ? {}
    : {
        id: input.id,
      }),
  kind: input.kind,
  term: input.term,
});

const model: BlockModel = {
  blocks: [
    blockOf({
      id: 'core',
      layer: Layer.Core,
    }),
    blockOf({
      id: 'typescript',
      layer: Layer.Language,
    }),
    blockOf({
      governs: [
        'docs/**',
        '.cache.ts',
      ],
      id: 'site',
      layer: Layer.Domain,
    }),
  ],
  roles: [
    roleOf({
      block: 'core',
      id: 'source',
      kind: TermKind.Folder,
      term: 'src/',
    }),
    roleOf({
      block: 'typescript',
      id: 'types',
      kind: TermKind.Folder,
      term: 'types/',
    }),
    roleOf({
      block: 'core',
      id: 'model',
      kind: TermKind.Suffix,
      term: '.model',
    }),
    roleOf({
      block: 'core',
      id: 'model-source',
      kind: TermKind.Suffix,
      term: '.model.ts',
    }),
    roleOf({
      block: 'typescript',
      id: 'typescript-source',
      kind: TermKind.Suffix,
      term: '.ts',
    }),
    roleOf({
      block: 'site',
      id: 'docs',
      kind: TermKind.Folder,
      term: 'docs/',
    }),
    roleOf({
      block: 'site',
      id: 'cache',
      kind: TermKind.Suffix,
      term: '.cache.ts',
    }),
    roleOf({
      block: 'core',
      kind: TermKind.Folder,
      term: 'lib/',
    }),
  ],
  rules: [],
};

describe('RoleNames.handTypedIn', () => {
  it.each<{
    condition: string;
    ids: string[];
    text: string;
  }>([
    {
      condition: 'a folder opens a path',
      ids: [
        'source',
      ],
      text: 'src/**',
    },
    {
      condition: "a folder of a language's block opens a path",
      ids: [
        'types',
      ],
      text: 'types/x',
    },
    {
      condition: 'a suffix ends a name, the longer of two suffixes taken first',
      ids: [
        'model-source',
      ],
      text: '**/*.model.ts',
    },
    {
      condition: "a suffix ends a name before a selector's close",
      ids: [
        'model',
      ],
      text: 'plugins[path=./rules/x.model]',
    },
    {
      condition: "a folder's spelling stands after a dot, where only a suffix stands",
      ids: [],
      text: 'x.src',
    },
    {
      condition: "a folder's spelling is no folder",
      ids: [],
      text: 'src.x',
    },
    {
      condition: "a suffix's spelling stands with no dot before it",
      ids: [],
      text: 'model',
    },
    {
      condition: "a suffix's spelling opens a longer name",
      ids: [],
      text: 'x.modelx',
    },
    {
      condition:
        "the spellings are a language's suffix, a name a block governs, or a term of no id",
      ids: [],
      text: "['**/*.ts', 'docs/**', 'x.cache.ts', 'lib/']",
    },
    {
      condition: 'a fact holds the spelling, or the spelling follows a fact',
      ids: [],
      text: '${x:src/} ${package.name}src/',
    },
  ])('should find the roles typed by hand when $condition', ({ ids, text }) => {
    // Act
    const found = RoleNames.handTypedIn(RoleNames.of(model), text);

    // Assert
    expect(found.map((role) => role.id)).toStrictEqual(ids);
  });

  it('should find no role when no role is named, where a folder or a suffix could stand', () => {
    // Act
    const found = RoleNames.handTypedIn(RoleNames.none, '/x.');

    // Assert
    expect(found).toStrictEqual([]);
  });
});
