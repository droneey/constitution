import { PRESETS_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import { Term } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { SourceKind } from '#/kernel/value-objects';

import { PLUGINS_FOLDER } from '../../../constants';
import type { PresetsFinding } from '../../../entities';
import { PresetEntry, PresetsCode } from '../../../entities';
import { Fact, FactKind } from '../../../value-objects';
import { TextPlace, textsOf } from './entry-texts.utils';

interface ReleaseFiles {
  /** each file its build makes, to its source, both from its folder */
  readonly builds: ReadonlyMap<string, string>;
  readonly files: ProjectFiles;
  /** absolute */
  readonly folder: string;
  /** its folder as findings name it; empty for the folder checked itself */
  readonly where: string;
}

const SEPARATOR = '/';
// A path from the release after its fact, up to what ends a path in a value or a command.
const RELEASE_FILE = /\$\{constitution\.path\}\/([^\s"'`,;)\]]+)/g;
const TRAILING_SEPARATOR = /\/$/;
// <reader>/plugins/<language>/<rule>.<extension>, from presets/.
const pluginPath = new RegExp(`^[^/]+/${PLUGINS_FOLDER}/[^/]+/([^/]+)\\.[^./]+$`);

interface ReleaseFindingsInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly release: ReleaseFiles;
  readonly rules: ReadonlySet<string>;
}

const whereOf = (release: ReleaseFiles, path: string): string =>
  release.where === '' ? path : `${release.where}${SEPARATOR}${path}`;

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

      const term = PresetEntry.roleOf({
        entry: input.entry,
        id: fact.role,
        model: input.model,
      });

      return term === undefined ? undefined : Term.roleNameOf(term);
    },
  });

  return written === undefined
    ? []
    : [
        ...written.matchAll(RELEASE_FILE),
      ].map((match) => String(match[1]).replace(TRAILING_SEPARATOR, ''));
};

const namedFilesOf = (input: { entry: PresetEntry; model: BlockModel }): readonly string[] =>
  textsOf(input.entry.value)
    .filter((text) => text.place !== TextPlace.File)
    .flatMap((text) =>
      releaseFilesIn({
        ...input,
        text: text.text,
      }),
    );

// A file the release lacks is sound where its build makes it from a source the release holds.
const isSound = (input: { file: string; release: ReleaseFiles }): boolean => {
  const { builds, files, folder } = input.release;
  const source = builds.get(input.file);

  return (
    files.exists(`${folder}${SEPARATOR}${input.file}`) ||
    // Stryker disable next-line ConditionalExpression: a source of no build names no file the folder holds
    (source !== undefined && files.exists(`${folder}${SEPARATOR}${source}`))
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
      }).map((file) => ({
        file,
        path: entry.set.file,
      })),
    );
  const namedFiles = new Set(named.map(({ file }) => file));
  const missing = named.flatMap(({ file, path }) =>
    isSound({
      file,
      release,
    })
      ? []
      : [
          {
            code: PresetsCode.MissingReleaseFile,
            details: {
              file,
            },
            path,
          } satisfies PresetsFinding,
        ],
  );
  // Stryker disable next-line ArrayDeclaration: a path that is no plugin's gives no finding
  const plugins = (release.files.listFiles(`${release.folder}${SEPARATOR}${PRESETS_FOLDER}`) ?? [])
    .toSorted(compareText)
    .flatMap((path) => {
      const rule = pluginPath.exec(path)?.[1];
      const file = `${PRESETS_FOLDER}${SEPARATOR}${path}`;

      return rule === undefined
        ? []
        : [
            ...(input.rules.has(rule)
              ? []
              : [
                  {
                    code: PresetsCode.PluginNamesNoRule,
                    details: {
                      rule,
                    },
                    path: whereOf(release, file),
                  } satisfies PresetsFinding,
                ]),
            ...(namedFiles.has(file)
              ? []
              : [
                  {
                    code: PresetsCode.PluginUnreferenced,
                    details: {},
                    path: whereOf(release, file),
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
