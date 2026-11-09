import { Level, PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { BlockModel, ModelRule } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { RepositoryRelativePath, RuleSlug, SourceKind } from '#/kernel/value-objects';

import { PresetEntry, TextPlace } from '../../../../../preset-entry/entities';
import { PLUGINS_FOLDER_NAME } from '../../../../../shared/constants';
import type { PresetsFinding } from '../../../../../shared/entities';
import { PresetsCode } from '../../../../../shared/entities';
import { Fact, FactKind } from '../../../../../shared/value-objects';
import type { ModelIndex } from '../index-model';

interface ReleaseFiles {
  readonly distributed: ReadonlySet<string>;
  readonly existing: ReadonlySet<string>;
  readonly folderPathFromRepository: RepositoryRelativePath;
  readonly pathsInPresets: readonly string[];
  readonly pluginTexts: ReadonlyMap<string, string>;
}

const pluginPath = new RegExp(`^(?:[^/]+/)+?${PLUGINS_FOLDER_NAME}/[^/]+/([^/]+)\\.[^./]+$`);
const BRACKETED = /\[([^\]\s]+)\]/g;

interface ReleaseFindingsInput {
  readonly entries: readonly PresetEntry[];
  readonly index: ModelIndex;
  readonly model: BlockModel;
  readonly release: ReleaseFiles;
}

interface NamedFile {
  readonly isCopied: boolean;
  readonly pathInRelease: string;
}

// Why: the files to look for are named before the check reads them again, and resolving an entry's
// roles is the dearest step of either, so an entry's are resolved once for each model.
const namedFilesByModel = new WeakMap<BlockModel, WeakMap<PresetEntry, readonly NamedFile[]>>();

const namedFilesOf = (input: { entry: PresetEntry; model: BlockModel }): readonly NamedFile[] => {
  const byEntry =
    namedFilesByModel.get(input.model) ?? new WeakMap<PresetEntry, readonly NamedFile[]>();
  const known = byEntry.get(input.entry);

  // Stryker disable next-line ConditionalExpression,BlockStatement: an answer worked out again equals the remembered one, which only saves time
  if (known !== undefined) {
    return known;
  }

  const named = PresetEntry.textsOf(input.entry)
    .filter((text) => text.place !== TextPlace.File)
    .flatMap((text) =>
      PresetEntry.releaseFilesIn({
        ...input,
        text: text.text,
      }).map((pathInRelease) => ({
        isCopied: text.place === TextPlace.Copied,
        pathInRelease,
      })),
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
): readonly (NamedFile & {
  readonly setFilePath: RepositoryRelativePath;
})[] =>
  input.entries
    .filter((entry) => entry.set.source.kind === SourceKind.Release)
    .flatMap((entry) =>
      namedFilesOf({
        entry,
        model: input.model,
      }).map((named) => ({
        ...named,
        setFilePath: entry.set.filePath,
      })),
    );

const releaseFilesNamedBy = (input: NamedFilesInput): readonly string[] => [
  ...new Set(namedInReleaseOf(input).map(({ pathInRelease }) => pathInRelease)),
];

const isPluginPath = (pathInPresets: string): boolean => pluginPath.test(pathInPresets);

const isKnownIn = (index: ModelIndex, fact: Fact): boolean => {
  if (fact.kind === FactKind.Role) {
    return index.roleIds.has(fact.role);
  }

  // Stryker disable next-line ConditionalExpression: the test of its kind only narrows the type
  return fact.kind === FactKind.Term && index.listIds.has(fact.term);
};

const factFindingsOf = (input: {
  index: ModelIndex;
  isNamedUnfilled: boolean;
  path: RepositoryRelativePath;
  text: string;
}): readonly PresetsFinding[] => {
  const references = Fact.referencesIn(input.text);

  return [
    ...references
      .filter(({ fact }) => !isKnownIn(input.index, fact))
      .map(
        ({ written }) =>
          ({
            code: PresetsCode.PluginUnknownFact,
            details: {
              fact: written,
            },
            path: input.path,
          }) satisfies PresetsFinding,
      ),
    ...(input.isNamedUnfilled && references.length > 0
      ? [
          {
            code: PresetsCode.PluginNamedUnfilled,
            details: {},
            path: input.path,
          } satisfies PresetsFinding,
        ]
      : []),
  ];
};

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
    pathInPresets: string;
    rule: string;
    uncopiedPaths: ReadonlySet<string>;
  },
): readonly PresetsFinding[] => {
  const { release } = input;
  const { rules } = input.index;
  const pathInRelease = `${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${input.pathInPresets}`;
  const path = RepositoryRelativePath.join(release.folderPathFromRepository, pathInRelease);
  const text = release.pluginTexts.get(input.pathInPresets);

  return [
    ...(RuleSlug.is(input.rule) && rules.has(input.rule)
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
    ...(input.namedPaths.has(pathInRelease) && text !== undefined
      ? rulesTheMessagesKey({
          rules,
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
    ...(text === undefined
      ? []
      : factFindingsOf({
          index: input.index,
          isNamedUnfilled: input.uncopiedPaths.has(pathInRelease),
          path,
          text,
        })),
  ];
};

const releaseFindings = (input: ReleaseFindingsInput): readonly PresetsFinding[] => {
  const { release } = input;
  const named = namedInReleaseOf(input);
  const namedPaths = new Set(named.map(({ pathInRelease }) => pathInRelease));
  const uncopiedPaths = new Set(
    named.filter(({ isCopied }) => !isCopied).map(({ pathInRelease }) => pathInRelease),
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
          pathInPresets,
          rule,
          uncopiedPaths,
        });
  });

  return [
    ...missing,
    ...plugins,
  ];
};

export type { NamedFilesInput, ReleaseFiles };
export { isPluginPath, releaseFilesNamedBy, releaseFindings };
