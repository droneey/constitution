import { PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { AbsolutePath, RepositoryRelativePath, RuleSlug, SourceKind } from '#/kernel/value-objects';

import { PLUGINS_FOLDER_NAME } from '../../../../constants';
import type { PresetsFinding } from '../../../../entities';
import { PresetEntry, PresetsCode, TextPlace } from '../../../../entities';
import { Fact, FactKind, FactName } from '../../../../value-objects';

interface ReleaseFiles {
  /** each file the distribution packs from a package that builds it, by its path in it */
  readonly distributed: ReadonlySet<string>;
  readonly files: ProjectFiles;
  readonly folderPath: AbsolutePath;
  /** how findings name its folder; empty for the folder checked itself */
  readonly folderPathFromRepository: RepositoryRelativePath;
}

// A path from the release after its fact, up to what ends a path in a value or a command.
const releaseFile = new RegExp(
  `${RegExp.escape(Fact.textOf(Fact.of(FactName.ConstitutionPath)))}/([^\\s"'\`,;)\\]]+)`,
  'g',
);
const TRAILING_SEPARATOR = /\/$/;
// <reader>/plugins/<language>/<rule>.<extension>, from presets/.
const pluginPath = new RegExp(`^[^/]+/${PLUGINS_FOLDER_NAME}/[^/]+/([^/]+)\\.[^./]+$`);

interface ReleaseFindingsInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly release: ReleaseFiles;
  readonly rules: ReadonlySet<RuleSlug>;
}

// The files of the release a text names, from the release, its roles written as their terms are.
const releaseFilesIn = (input: {
  entry: PresetEntry;
  model: BlockModel;
  text: string;
}): readonly string[] => {
  // a role no term defines leaves the text unread, as its own finding says
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

// A file the release lacks is sound where the distribution packs it from a package that builds it.
const isSound = (input: { pathInRelease: string; release: ReleaseFiles }): boolean => {
  const { distributed, files, folderPath } = input.release;

  return (
    files.exists(AbsolutePath.join(folderPath, input.pathInRelease)) ||
    distributed.has(input.pathInRelease)
  );
};

const releaseFindings = (input: ReleaseFindingsInput): readonly PresetsFinding[] => {
  const { release } = input;
  // A pack's entries name the release's files as the project's, never as the release's own.
  const named = input.entries
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
  const plugins =
    // Stryker disable next-line ArrayDeclaration: a path that is no plugin's gives no finding
    (release.files.listFiles(AbsolutePath.join(release.folderPath, PRESETS_FOLDER_NAME)) ?? [])
      .toSorted(compareText)
      .flatMap((pathInPresets) => {
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

export type { ReleaseFiles };
export { releaseFindings };
