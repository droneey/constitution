import { BlockFormat, Level, PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { BlockModel, ModelRule } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { RepositoryRelativePath, RuleSlug, SourceKind } from '#/kernel/value-objects';

import { PresetEntry, TextPlace } from '../../../../../preset-entry/entities';
import { PLUGINS_FOLDER_NAME } from '../../../../../shared/constants';
import type { PresetsFinding } from '../../../../../shared/entities';
import { PresetsCode } from '../../../../../shared/entities';
import { Fact, FactKind, FactName } from '../../../../../shared/value-objects';

interface ReleaseFiles {
  readonly distributed: ReadonlySet<string>;
  readonly existing: ReadonlySet<string>;
  readonly folderPathFromRepository: RepositoryRelativePath;
  readonly pathsInPresets: readonly string[];
  readonly pluginTexts: ReadonlyMap<string, string>;
}

const releaseFile = new RegExp(
  `${RegExp.escape(Fact.textOf(Fact.of(FactName.ConstitutionPath)))}/([^\\s"'\`,;)\\]]+)`,
  'g',
);
const TRAILING_SEPARATOR = /\/$/;
const pluginPath = new RegExp(`^(?:[^/]+/)+?${PLUGINS_FOLDER_NAME}/[^/]+/([^/]+)\\.[^./]+$`);
const BRACKETED = /\[([^\]\s]+)\]/g;

interface ReleaseFindingsInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly release: ReleaseFiles;
  readonly rules: ReadonlyMap<RuleSlug, ModelRule>;
}

const releaseFilesIn = (input: {
  entry: PresetEntry;
  model: BlockModel;
  text: string;
}): readonly string[] => {
  const written = Fact.resolvedIn({
    text: input.text,
    valueOf: (fact) => {
      if (fact.kind !== FactKind.Role) {
        return Fact.textOf(fact);
      }

      return PresetEntry.roleNameOf({
        entry: input.entry,
        id: fact.role,
        model: input.model,
      });
    },
  });

  return written === undefined
    ? []
    : [
        ...written.matchAll(releaseFile),
      ].map((match) => String(match[1]).replace(TRAILING_SEPARATOR, ''));
};

// Why: the files to look for are named before the check reads them again, and resolving an entry's
// roles is the dearest step of either, so an entry's are resolved once for each model.
const namedFilesByModel = new WeakMap<BlockModel, WeakMap<PresetEntry, readonly string[]>>();

const namedFilesOf = (input: { entry: PresetEntry; model: BlockModel }): readonly string[] => {
  const byEntry =
    namedFilesByModel.get(input.model) ?? new WeakMap<PresetEntry, readonly string[]>();
  const known = byEntry.get(input.entry);

  // Stryker disable next-line ConditionalExpression,BlockStatement: an answer worked out again equals the remembered one, which only saves time
  if (known !== undefined) {
    return known;
  }

  const named = PresetEntry.textsOf(input.entry)
    .filter((text) => text.place !== TextPlace.File)
    .flatMap((text) =>
      releaseFilesIn({
        ...input,
        text: text.text,
      }),
    );

  // Stryker disable next-line CallExpression: an answer not remembered is worked out again, alike
  namedFilesByModel.set(input.model, byEntry.set(input.entry, named));

  return named;
};

const isSound = (input: { pathInRelease: string; release: ReleaseFiles }): boolean => {
  const { distributed, existing } = input.release;

  return existing.has(input.pathInRelease) || distributed.has(input.pathInRelease);
};

interface NamedFilesInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
}

const namedInReleaseOf = (
  input: NamedFilesInput,
): readonly {
  readonly format: BlockFormat;
  readonly pathInRelease: string;
  readonly setFilePath: RepositoryRelativePath;
}[] =>
  input.entries
    .filter((entry) => entry.set.source.kind === SourceKind.Release)
    .flatMap((entry) =>
      namedFilesOf({
        entry,
        model: input.model,
      }).map((pathInRelease) => ({
        format: entry.set.placeInPresets.format,
        pathInRelease,
        setFilePath: entry.set.filePath,
      })),
    );

const releaseFilesNamedBy = (input: NamedFilesInput): readonly string[] => [
  ...new Set(namedInReleaseOf(input).map(({ pathInRelease }) => pathInRelease)),
];

const isPluginPath = (pathInPresets: string): boolean => pluginPath.test(pathInPresets);

const rulesTheMessagesKey = (input: {
  rules: ReadonlyMap<RuleSlug, ModelRule>;
  text: string;
}): readonly ModelRule[] => [
  ...new Set(
    [
      ...input.text.matchAll(BRACKETED),
    ].flatMap((match) => {
      const slug = String(match[1]);

      return RuleSlug.is(slug) ? (input.rules.get(slug) ?? []) : [];
    }),
  ),
];

const pluginFindings = (
  input: ReleaseFindingsInput & {
    namedPaths: ReadonlySet<string>;
    nestedNamedPaths: ReadonlySet<string>;
    pathInPresets: string;
    rule: string;
  },
): readonly PresetsFinding[] => {
  const { release } = input;
  const pathInRelease = `${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${input.pathInPresets}`;
  const path = RepositoryRelativePath.join(release.folderPathFromRepository, pathInRelease);
  const text = release.pluginTexts.get(input.pathInPresets);

  return [
    ...(RuleSlug.is(input.rule) && input.rules.has(input.rule)
      ? []
      : [
          {
            code: PresetsCode.PluginNamesNoRule,
            details: {
              rule: input.rule,
            },
            path,
          } satisfies PresetsFinding,
        ]),
    ...(input.namedPaths.has(pathInRelease)
      ? []
      : [
          {
            code: PresetsCode.PluginUnreferenced,
            details: {},
            path,
          } satisfies PresetsFinding,
        ]),
    // Why: the legacy presets name rules the nested tree raises to MUST, so a level is held only
    // for a plugin a preset file of the nested format names until the legacy format goes.
    ...(input.nestedNamedPaths.has(pathInRelease) && text !== undefined
      ? rulesTheMessagesKey({
          rules: input.rules,
          text,
        })
          .filter(({ level }) => level !== Level.Must)
          .map(
            ({ level, slug }) =>
              ({
                code: PresetsCode.PluginRuleNotMust,
                details: {
                  level,
                  rule: slug,
                },
                path,
              }) satisfies PresetsFinding,
          )
      : []),
  ];
};

const releaseFindings = (input: ReleaseFindingsInput): readonly PresetsFinding[] => {
  const { release } = input;
  const named = namedInReleaseOf(input);
  const namedPaths = new Set(named.map(({ pathInRelease }) => pathInRelease));
  const nestedNamedPaths = new Set(
    named
      .filter(({ format }) => format === BlockFormat.Nested)
      .map(({ pathInRelease }) => pathInRelease),
  );
  const missing = named.flatMap(({ pathInRelease, setFilePath }) =>
    isSound({
      pathInRelease,
      release,
    })
      ? []
      : [
          {
            code: PresetsCode.MissingDistributionFile,
            details: {
              file: pathInRelease,
            },
            path: setFilePath,
          } satisfies PresetsFinding,
        ],
  );
  const plugins = release.pathsInPresets.toSorted(compareText).flatMap((pathInPresets) => {
    const rule = pluginPath.exec(pathInPresets)?.[1];

    return rule === undefined
      ? []
      : pluginFindings({
          ...input,
          namedPaths,
          nestedNamedPaths,
          pathInPresets,
          rule,
        });
  });

  return [
    ...missing,
    ...plugins,
  ];
};

export type { NamedFilesInput, ReleaseFiles };
export { isPluginPath, releaseFilesNamedBy, releaseFindings };
