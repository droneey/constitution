import { PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { FileReadStatus } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { BlockSource } from '#/kernel/value-objects';
import { AbsolutePath, BlockId, RepositoryRelativePath, RuleSlug } from '#/kernel/value-objects';

import { EVERY } from '../../../../domain/constants';
import type { PresetFileParser, PresetFileRead } from '../../../contracts';
import { PresetFileReadStatus } from '../../../contracts';
import type {
  LanguageKey,
  PresetEntry,
  PresetPair,
  PresetSet,
  PresetsFinding,
  PresetsProblem,
  PresetValue,
  RuleKey,
} from '../../../../domain/entities';
import { PresetsCode, ValueKind } from '../../../../domain/entities';
import { EntryTarget, PathKind, PresetFilePath } from '../../../../domain/value-objects';

interface LoadPresetSetsInput {
  readonly files: ProjectFiles;
  readonly parser: PresetFileParser;
  readonly source: BlockSource;
  readonly sourceFolderPath: AbsolutePath;
  readonly sourceFolderPathFromRepository: RepositoryRelativePath;
}

interface PresetSetsLoaded {
  readonly entries: readonly PresetEntry[];
  readonly findings: readonly PresetsFinding[];
}

const isRuleKey = (key: string): key is RuleKey => key === EVERY || RuleSlug.is(key);

const isLanguageKey = (key: string): key is LanguageKey => key === EVERY || BlockId.is(key);

const entriesIn = (input: { set: PresetSet; value: PresetValue }): PresetSetsLoaded => {
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

const loadedFrom = (
  input: LoadPresetSetsInput & {
    pathInPresets: string;
  },
): PresetSetsLoaded => {
  const pathInSource = `${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${input.pathInPresets}`;
  const filePath = RepositoryRelativePath.join(input.sourceFolderPathFromRepository, pathInSource);
  const place = PresetFilePath.readOf(input.pathInPresets);

  if (place.kind !== PathKind.PresetFile) {
    return {
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
    };
  }

  const read = input.files.read(AbsolutePath.join(input.sourceFolderPath, pathInSource));
  const parsed: PresetFileRead =
    read.status === FileReadStatus.Read
      ? input.parser.parse(read.text)
      : {
          status: PresetFileReadStatus.Unparsed,
        };

  if (parsed.status === PresetFileReadStatus.Unparsed) {
    return {
      entries: [],
      findings: [
        {
          code: PresetsCode.PresetFileUnparsed,
          details:
            parsed.line === undefined
              ? {}
              : {
                  line: parsed.line,
                },
          path: filePath,
        },
      ],
    };
  }

  return entriesIn({
    set: {
      filePath,
      placeInPresets: place.presetFile,
      source: input.source,
    },
    value: parsed.value,
  });
};

const loadPresetSets = (input: LoadPresetSetsInput): PresetSetsLoaded => {
  const presetsFolderPath = AbsolutePath.join(input.sourceFolderPath, PRESETS_FOLDER_NAME);
  // Stryker disable next-line ArrayDeclaration: a path that names no preset file is data
  const pathsInPresets = (input.files.listFiles(presetsFolderPath) ?? []).toSorted(compareText);
  const loaded = pathsInPresets.map((pathInPresets) =>
    loadedFrom({
      ...input,
      pathInPresets,
    }),
  );

  return {
    entries: loaded.flatMap((one) => one.entries),
    findings: loaded.flatMap((one) => one.findings),
  };
};

export type { LoadPresetSetsInput, PresetSetsLoaded };
export { loadPresetSets };
