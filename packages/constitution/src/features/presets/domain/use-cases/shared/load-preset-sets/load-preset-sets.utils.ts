import { PRESETS_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { FileReadStatus } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { BlockSource } from '#/kernel/value-objects';

import type { PresetFileParser, PresetFileRead } from '../../../contracts';
import { PresetFileReadStatus } from '../../../contracts';
import type {
  PresetEntry,
  PresetPair,
  PresetSet,
  PresetsFinding,
  PresetValue,
} from '../../../entities';
import { PresetsCode, ValueKind } from '../../../entities';
import { PathKind, PresetFilePath, TargetFile } from '../../../value-objects';

interface LoadPresetSetsInput {
  readonly files: ProjectFiles;
  /** the absolute folder whose presets/ holds the preset files */
  readonly folder: string;
  readonly parser: PresetFileParser;
  readonly source: BlockSource;
  /** the folder as findings name it; empty for the folder checked itself */
  readonly where: string;
}

interface PresetSetsLoaded {
  readonly entries: readonly PresetEntry[];
  readonly findings: readonly PresetsFinding[];
}

const SEPARATOR = '/';

const fileOf = (input: { path: string; where: string }): string =>
  [
    input.where,
    PRESETS_FOLDER,
    input.path,
  ]
    .filter((part) => part !== '')
    .join(SEPARATOR);

// The entries of a preset file's value, block → rule → language → file, in the order it writes them;
// a value that is no map where the next key is due is a finding that names the keys down to it.
const entriesIn = (input: { set: PresetSet; value: PresetValue }): PresetSetsLoaded => {
  const { set } = input;
  const entries: PresetEntry[] = [];
  const findings: PresetsFinding[] = [];

  const pairsOf = (given: PresetValue, keys: readonly string[]): readonly PresetPair[] => {
    if (given.kind === ValueKind.Map) {
      return given.pairs;
    }

    findings.push({
      code: PresetsCode.EntryMisshapen,
      details: {
        keys,
      },
      path: set.file,
    });

    return [];
  };

  for (const block of pairsOf(input.value, [])) {
    for (const rule of pairsOf(block.value, [
      block.key,
    ])) {
      for (const language of pairsOf(rule.value, [
        block.key,
        rule.key,
      ])) {
        for (const file of pairsOf(language.value, [
          block.key,
          rule.key,
          language.key,
        ])) {
          entries.push({
            block: block.key,
            file: TargetFile.of(file.key),
            index: entries.length,
            language: language.key,
            rule: rule.key,
            set,
            value: file.value,
          });
        }
      }
    }
  }

  return {
    entries,
    findings,
  };
};

const loadedFrom = (
  input: LoadPresetSetsInput & {
    path: string;
  },
): PresetSetsLoaded => {
  const file = fileOf(input);
  const place = PresetFilePath.readOf(input.path);

  if (place.kind !== PathKind.PresetFile) {
    return {
      entries: [],
      findings:
        place.kind === PathKind.Misplaced
          ? [
              {
                code: PresetsCode.PresetFileMisplaced,
                details: {},
                path: file,
              },
            ]
          : [],
    };
  }

  const read = input.files.read(`${input.folder}/${PRESETS_FOLDER}/${input.path}`);
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
          path: file,
        },
      ],
    };
  }

  return entriesIn({
    set: {
      file,
      path: place.presetFile,
      source: input.source,
    },
    value: parsed.value,
  });
};

/** In the order of their paths. */
const loadPresetSets = (input: LoadPresetSetsInput): PresetSetsLoaded => {
  // Stryker disable next-line ArrayDeclaration: a path that names no preset file is data
  const paths = (input.files.listFiles(`${input.folder}/${PRESETS_FOLDER}`) ?? []).toSorted(
    compareText,
  );
  const loaded = paths.map((path) =>
    loadedFrom({
      ...input,
      path,
    }),
  );

  return {
    entries: loaded.flatMap((one) => one.entries),
    findings: loaded.flatMap((one) => one.findings),
  };
};

export type { LoadPresetSetsInput, PresetSetsLoaded };
export { loadPresetSets };
