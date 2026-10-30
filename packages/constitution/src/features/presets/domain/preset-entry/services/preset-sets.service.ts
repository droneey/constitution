import { PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { BlockSource } from '#/kernel/value-objects';
import { BlockId, RepositoryRelativePath, RuleSlug } from '#/kernel/value-objects';

import type { PresetPair, PresetValue } from '../../setting/entities';
import { ValueKind } from '../../setting/entities';
import { EVERY } from '../../shared/constants';
import type { PresetsFinding, PresetsProblem } from '../../shared/entities';
import { PresetsCode } from '../../shared/entities';
import { EntryTarget, PathKind, PresetFilePath } from '../../shared/value-objects';
import type { LanguageKey, PresetEntry, PresetSet, RuleKey } from '../entities';

interface PresetSetsLoaded {
  readonly entries: readonly PresetEntry[];
  readonly findings: readonly PresetsFinding[];
}

enum SetPlaceKind {
  Set = 'set',
  Skipped = 'skipped',
}

type SetPlace =
  | {
      readonly kind: SetPlaceKind.Set;
      readonly pathInSource: string;
      readonly set: PresetSet;
    }
  | {
      readonly kind: SetPlaceKind.Skipped;
      readonly loaded: PresetSetsLoaded;
    };

interface SetPlaceInput {
  readonly pathInPresets: string;
  readonly source: BlockSource;
  readonly sourceFolderPathFromRepository: RepositoryRelativePath;
}

const isRuleKey = (key: string): key is RuleKey => key === EVERY || RuleSlug.is(key);

const isLanguageKey = (key: string): key is LanguageKey => key === EVERY || BlockId.is(key);

interface EntriesInInput {
  readonly set: PresetSet;
  readonly value: PresetValue;
}

const entriesIn = (input: EntriesInInput): PresetSetsLoaded => {
  const { set } = input;
  const entries: PresetEntry[] = [];
  const problems: PresetsProblem[] = [];

  const pairsOf = (given: PresetValue, keys: readonly string[]): readonly PresetPair[] => {
    if (given.kind === ValueKind.Map) {
      return given.pairs;
    }

    problems.push({
      code: PresetsCode.EntryMisshapen,
      details: {
        keys,
      },
    });

    return [];
  };

  const keyedOf = <TKey extends string>(level: {
    given: PresetValue;
    isKey: (key: string) => key is TKey;
    keys: readonly string[];
    unknownOf: (key: string) => PresetsProblem;
  }): readonly {
    readonly key: TKey;
    readonly value: PresetValue;
  }[] =>
    pairsOf(level.given, level.keys).flatMap((pair) => {
      if (level.isKey(pair.key)) {
        return [
          {
            key: pair.key,
            value: pair.value,
          },
        ];
      }

      problems.push(level.unknownOf(pair.key));

      return [];
    });

  for (const { key: block, value: rules } of keyedOf({
    given: input.value,
    isKey: BlockId.is,
    keys: [],
    unknownOf: (key) => ({
      code: PresetsCode.UnknownBlock,
      details: {
        block: key,
      },
    }),
  })) {
    for (const { key: rule, value: languages } of keyedOf({
      given: rules,
      isKey: isRuleKey,
      keys: [
        block,
      ],
      unknownOf: (key) => ({
        code: PresetsCode.UnknownRule,
        details: {
          block,
          rule: key,
        },
      }),
    })) {
      for (const { key: language, value: targets } of keyedOf({
        given: languages,
        isKey: isLanguageKey,
        keys: [
          block,
          rule,
        ],
        unknownOf: (key) => ({
          code: PresetsCode.UnknownLanguage,
          details: {
            block,
            language: key,
            rule,
          },
        }),
      })) {
        for (const file of pairsOf(targets, [
          block,
          rule,
          language,
        ])) {
          entries.push({
            ...EntryTarget.of(file.key),
            block,
            index: entries.length,
            language,
            rule,
            set,
            value: file.value,
          });
        }
      }
    }
  }

  return {
    entries,
    findings: problems.map((problem) => ({
      ...problem,
      path: set.filePath,
    })),
  };
};

const setPlaceOf = (input: SetPlaceInput): SetPlace => {
  const pathInSource = `${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${input.pathInPresets}`;
  const filePath = RepositoryRelativePath.join(input.sourceFolderPathFromRepository, pathInSource);
  const place = PresetFilePath.readOf(input.pathInPresets);

  if (place.kind !== PathKind.PresetFile) {
    return {
      kind: SetPlaceKind.Skipped,
      loaded: {
        entries: [],
        findings:
          place.kind === PathKind.Misplaced
            ? [
                {
                  code: PresetsCode.PresetFileMisplaced,
                  details: {},
                  path: filePath,
                },
              ]
            : [],
      },
    };
  }

  return {
    kind: SetPlaceKind.Set,
    pathInSource,
    set: {
      filePath,
      placeInPresets: place.presetFile,
      source: input.source,
    },
  };
};

interface UnparsedSetInput {
  readonly set: PresetSet;
  readonly unparsed: {
    readonly line?: number;
  };
}

const unparsedSetOf = (input: UnparsedSetInput): PresetSetsLoaded => ({
  entries: [],
  findings: [
    {
      code: PresetsCode.PresetFileUnparsed,
      details:
        input.unparsed.line === undefined
          ? {}
          : {
              line: input.unparsed.line,
            },
      path: input.set.filePath,
    },
  ],
});

export type { EntriesInInput, PresetSetsLoaded, SetPlaceInput, UnparsedSetInput };
export { entriesIn, SetPlaceKind, setPlaceOf, unparsedSetOf };
