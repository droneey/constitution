import { AXES, LAYER_RANK, Layer } from '#/kernel/constants';
import { BlockModel, Term } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type {
  BlockId,
  BlockSource,
  RepositoryRelativePath,
  RuleSlug,
} from '#/kernel/value-objects';
import { SourceKind } from '#/kernel/value-objects';

import { EVERY } from '../constants';
import type { EntryTarget, TargetFile } from '../value-objects';
import { Fact, FactKind, PresetFilePath, TargetKind } from '../value-objects';
import type { Contribution } from './merged-file.entity';
import type { PresetValue } from './preset-value.entity';
import { ValueKind } from './preset-value.entity';
import type { EntryNamed } from './presets-finding.entity';
import { Setting } from './setting.entity';

/** A preset file: one reader's entries on one axis, under the blocks its path names. */
interface PresetSet {
  readonly filePath: RepositoryRelativePath;
  readonly placeInPresets: PresetFilePath;
  readonly source: BlockSource;
}

/** The rule an entry is keyed by: one rule, or every rule of its block. */
type RuleKey = RuleSlug | typeof EVERY;

/** The language an entry is keyed by: one language's block, or every language. */
type LanguageKey = BlockId | typeof EVERY;

enum TextPlace {
  /** the file an entry writes, which names no fact but a role */
  Path = 'path',
  Key = 'key',
  Value = 'value',
  Item = 'item',
  /** a whole file's text, written as a default: the file itself, whose names are its own */
  File = 'file',
}

/** A text an entry writes, where facts and folder names may stand. */
interface EntryText {
  readonly place: TextPlace;
  readonly text: string;
}

/**
 * One setting of a preset file, keyed `<block> → <rule> | * → <language> | * → <target>`. Its
 * target's fields are its own rather than a nested value's, as TypeScript narrows a union only by
 * a field of its own: a branch on the kind narrows the entry.
 */
type PresetEntry = EntryTarget & {
  readonly block: BlockId;
  /** its place in its preset file, which orders the entries of one block */
  readonly index: number;
  readonly language: LanguageKey;
  readonly rule: RuleKey;
  readonly set: PresetSet;
  readonly value: PresetValue;
};

const packOf = (source: BlockSource): string =>
  source.kind === SourceKind.Pack ? source.pack : '';

const orderOf = (model: BlockModel): ((left: PresetEntry, right: PresetEntry) => number) => {
  const layers = new Map<BlockId, Layer>(
    model.blocks.map((block) => [
      block.id,
      block.layer,
    ]),
  );

  // a block the model does not know sorts with the implementations, the most specific layer
  const rankOf = (entry: PresetEntry): number =>
    LAYER_RANK[layers.get(entry.block) ?? Layer.Implementation];

  return (left: PresetEntry, right: PresetEntry): number =>
    rankOf(left) - rankOf(right) ||
    compareText(left.block, right.block) ||
    AXES.indexOf(left.set.placeInPresets.axis) - AXES.indexOf(right.set.placeInPresets.axis) ||
    compareText(packOf(left.set.source), packOf(right.set.source)) ||
    compareText(
      PresetFilePath.textOf(left.set.placeInPresets),
      PresetFilePath.textOf(right.set.placeInPresets),
    ) ||
    left.index - right.index;
};

const sourceOf = (entry: PresetEntry): string =>
  `${entry.set.filePath}: ${entry.block} → ${entry.rule}`;

const namedOf = (entry: PresetEntry): EntryNamed => ({
  block: entry.block,
  rule: entry.rule,
});

/**
 * The block that brings the entry into a file: the first block its preset file's path names beyond
 * the reader, or the reader.
 */
const blockOf = (entry: PresetEntry): BlockId =>
  entry.set.placeInPresets.withs[0] ?? entry.set.placeInPresets.reader;

/**
 * The name an entry's `${role.<id>}` gives a path: its term as its language spells it, or, for an
 * entry of every language, as the blocks its key and its preset file name do; undefined where no
 * term defines the role.
 */
const roleNameOf = (input: {
  entry: PresetEntry;
  id: string;
  model: BlockModel;
}): string | undefined => {
  const { entry } = input;
  const term = BlockModel.roleOf(input.model, {
    id: input.id,
    readers:
      entry.language === EVERY
        ? [
            entry.block,
            entry.set.placeInPresets.reader,
            ...entry.set.placeInPresets.withs,
          ]
        : [
            entry.language,
          ],
  });

  return term === undefined ? undefined : Term.roleNameOf(term);
};

/**
 * The path from its unit's folder the entry's key writes, its roles named; undefined where it names
 * a role no term defines, or any other fact.
 */
const writtenPathOf = (input: {
  entry: PresetEntry & TargetFile;
  model: BlockModel;
}): string | undefined =>
  Fact.resolvedIn({
    text: input.entry.writtenPath,
    valueOf: (fact) =>
      fact.kind === FactKind.Role
        ? roleNameOf({
            entry: input.entry,
            id: fact.role,
            model: input.model,
          })
        : undefined,
  });

/** What the entry contributes is its own value, or its value with its facts resolved. */
const contributionOf = (entry: PresetEntry, contributed: PresetValue): Contribution => ({
  block: blockOf(entry),
  source: sourceOf(entry),
  value: contributed,
});

const textsOfSetting = (setting: Setting, place: TextPlace): readonly EntryText[] => {
  if (Setting.isList(setting)) {
    return setting.flatMap((listed) => textsOfSetting(listed, TextPlace.Item));
  }

  if (Setting.isMap(setting)) {
    return Object.entries(setting).flatMap(([key, held]) => [
      {
        place: TextPlace.Key,
        text: key,
      },
      ...textsOfSetting(held, TextPlace.Value),
    ]);
  }

  return typeof setting === 'string'
    ? [
        {
          place,
          text: setting,
        },
      ]
    : [];
};

const textsOfValue = (given: PresetValue): readonly EntryText[] =>
  given.kind === ValueKind.Map
    ? given.pairs.flatMap((pair) => [
        {
          place: TextPlace.Key,
          text: pair.key,
        },
        ...textsOfValue(pair.value),
      ])
    : textsOfSetting(given.setting, TextPlace.Value);

/** The texts of the entry's value: its keys, values and items, or the whole file it writes. */
const textsOf = (entry: PresetEntry): readonly EntryText[] =>
  entry.value.kind === ValueKind.Default && typeof entry.value.setting === 'string'
    ? [
        {
          place: TextPlace.File,
          text: entry.value.setting,
        },
      ]
    : textsOfValue(entry.value);

/** The ids of the roles an entry names: in the path of the file it writes, its guard and its value. */
const roleIdsOf = (entry: PresetEntry): readonly string[] =>
  [
    // Stryker disable next-line ConditionalExpression: a run's target holds no path, so read as a file's it gives none
    entry.kind === TargetKind.File ? entry.writtenPath : undefined,
    entry.guard === undefined ? undefined : Fact.textOf(entry.guard.fact),
    entry.guard?.equals,
    ...textsOf(entry).map(({ text }) => text),
  ]
    .filter((text) => text !== undefined)
    .flatMap((text) => Fact.referencesIn(text))
    .map(({ fact }) => fact)
    .filter((fact) => fact.kind === FactKind.Role)
    .map((fact) => fact.role);

const PresetEntry = {
  blockOf,
  contributionOf,
  namedOf,
  orderOf,
  roleIdsOf,
  roleNameOf,
  sourceOf,
  textsOf,
  writtenPathOf,
} as const;

export type { EntryText, LanguageKey, PresetSet, RuleKey };
export { PresetEntry, TextPlace };
