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

interface PresetSet {
  readonly filePath: RepositoryRelativePath;
  readonly placeInPresets: PresetFilePath;
  readonly source: BlockSource;
}

type RuleKey = RuleSlug | typeof EVERY;

type LanguageKey = BlockId | typeof EVERY;

enum TextPlace {
  Path = 'path',
  Key = 'key',
  Value = 'value',
  Item = 'item',
  File = 'file',
}

interface EntryText {
  readonly place: TextPlace;
  readonly text: string;
}

// Why: the target's fields are the entry's own rather than a nested value's, as TypeScript narrows
// a union only by a field of its own.
type PresetEntry = EntryTarget & {
  readonly block: BlockId;
  readonly index: number;
  readonly language: LanguageKey;
  readonly rule: RuleKey;
  readonly set: PresetSet;
  readonly value: PresetValue;
};

const mostSpecificLayer = Layer.Implementation;

const packOf = (source: BlockSource): string =>
  source.kind === SourceKind.Pack ? source.pack : '';

const orderOf = (model: BlockModel): ((left: PresetEntry, right: PresetEntry) => number) => {
  const layers = new Map<BlockId, Layer>(
    model.blocks.map((block) => [
      block.id,
      block.layer,
    ]),
  );

  const layerRankOf = (entry: PresetEntry): number =>
    LAYER_RANK[layers.get(entry.block) ?? mostSpecificLayer];

  return (left: PresetEntry, right: PresetEntry): number =>
    layerRankOf(left) - layerRankOf(right) ||
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

const bringingBlockOf = (entry: PresetEntry): BlockId =>
  entry.set.placeInPresets.withs[0] ?? entry.set.placeInPresets.reader;

// Why: a block that keys an entry brought it before another block stood in for it, so a comment an
// earlier apply wrote may name it.
const blocksCommentsNameOf = (entry: PresetEntry): readonly BlockId[] => [
  bringingBlockOf(entry),
  entry.block,
];

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

const contributionOf = (entry: PresetEntry, contributed: PresetValue): Contribution => ({
  block: bringingBlockOf(entry),
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

const textsOf = (entry: PresetEntry): readonly EntryText[] =>
  entry.value.kind === ValueKind.Default && typeof entry.value.setting === 'string'
    ? [
        {
          place: TextPlace.File,
          text: entry.value.setting,
        },
      ]
    : textsOfValue(entry.value);

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
  bringingBlockOf,
  blocksCommentsNameOf,
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
