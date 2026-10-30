import { PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { BlockModel } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { RepositoryRelativePath, RuleSlug, SourceKind } from '#/kernel/value-objects';

import { PLUGINS_FOLDER_NAME } from '../../../../constants';
import type { PresetsFinding } from '../../../../entities';
import { PresetEntry, PresetsCode, TextPlace } from '../../../../entities';
import { Fact, FactKind, FactName } from '../../../../value-objects';

interface ReleaseFiles {
  readonly distributed: ReadonlySet<string>;
  readonly existing: ReadonlySet<string>;
  readonly folderPathFromRepository: RepositoryRelativePath;
  readonly pathsInPresets: readonly string[];
}

const releaseFile = new RegExp(
  `${RegExp.escape(Fact.textOf(Fact.of(FactName.ConstitutionPath)))}/([^\\s"'\`,;)\\]]+)`,
  'g',
);
const TRAILING_SEPARATOR = /\/$/;
const pluginPath = new RegExp(`^[^/]+/${PLUGINS_FOLDER_NAME}/[^/]+/([^/]+)\\.[^./]+$`);

interface ReleaseFindingsInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly release: ReleaseFiles;
  readonly rules: ReadonlySet<RuleSlug>;
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

const namedFilesOf = (input: { entry: PresetEntry; model: BlockModel }): readonly string[] =>
  PresetEntry.textsOf(input.entry)
    .filter((text) => text.place !== TextPlace.File)
    .flatMap((text) =>
      releaseFilesIn({
        ...input,
        text: text.text,
      }),
    );

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
        pathInRelease,
        setFilePath: entry.set.filePath,
      })),
    );

const releaseFilesNamedBy = (input: NamedFilesInput): readonly string[] => [
  ...new Set(namedInReleaseOf(input).map(({ pathInRelease }) => pathInRelease)),
];

const releaseFindings = (input: ReleaseFindingsInput): readonly PresetsFinding[] => {
  const { release } = input;
  const named = namedInReleaseOf(input);
  const namedPaths = new Set(named.map(({ pathInRelease }) => pathInRelease));
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
    const pathInRelease = `${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${pathInPresets}`;

    return rule === undefined
      ? []
      : [
          ...(RuleSlug.is(rule) && input.rules.has(rule)
            ? []
            : [
                {
                  code: PresetsCode.PluginNamesNoRule,
                  details: {
                    rule,
                  },
                  path: RepositoryRelativePath.join(
                    release.folderPathFromRepository,
                    pathInRelease,
                  ),
                } satisfies PresetsFinding,
              ]),
          ...(namedPaths.has(pathInRelease)
            ? []
            : [
                {
                  code: PresetsCode.PluginUnreferenced,
                  details: {},
                  path: RepositoryRelativePath.join(
                    release.folderPathFromRepository,
                    pathInRelease,
                  ),
                } satisfies PresetsFinding,
              ]),
        ];
  });

  return [
    ...missing,
    ...plugins,
  ];
};

export type { NamedFilesInput, ReleaseFiles };
export { releaseFilesNamedBy, releaseFindings };
