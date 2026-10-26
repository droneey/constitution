import { PRESETS_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { RoleTerm } from '#/kernel/entities';
import { Term } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { SourceKind } from '#/kernel/value-objects';

import { PLUGINS_FOLDER } from '../../../constants';
import type { PresetEntry, PresetsFinding } from '../../../entities';
import { PresetsCode } from '../../../entities';
import { Fact, FactKind } from '../../../value-objects';
import { TextPlace, textsOf } from './entry-texts.utils';

interface ReleaseFiles {
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
  readonly release: ReleaseFiles;
  readonly roles: ReadonlyMap<string, RoleTerm>;
  readonly rules: ReadonlySet<string>;
}

const whereOf = (release: ReleaseFiles, path: string): string =>
  release.where === '' ? path : `${release.where}${SEPARATOR}${path}`;

// The files of the release a text names, from the release, its roles written as their terms are.
const releaseFilesIn = (input: {
  roles: ReadonlyMap<string, RoleTerm>;
  text: string;
}): readonly string[] => {
  // a role no term defines leaves the text unread, as its own finding says
  const written = Fact.resolvedIn({
    text: input.text,
    valueOf: (fact) => {
      if (fact.kind !== FactKind.Role) {
        return Fact.textOf(fact);
      }

      const term = input.roles.get(fact.role);

      return term === undefined ? undefined : Term.roleNameOf(term);
    },
  });

  return written === undefined
    ? []
    : [
        ...written.matchAll(RELEASE_FILE),
      ].map((match) => String(match[1]).replace(TRAILING_SEPARATOR, ''));
};

const namedFilesOf = (input: {
  entry: PresetEntry;
  roles: ReadonlyMap<string, RoleTerm>;
}): readonly string[] =>
  input.entry.set.source.kind === SourceKind.Release
    ? textsOf(input.entry.value)
        .filter((text) => text.place !== TextPlace.File)
        .flatMap((text) =>
          releaseFilesIn({
            roles: input.roles,
            text: text.text,
          }),
        )
    : [];

const releaseFindings = (input: ReleaseFindingsInput): readonly PresetsFinding[] => {
  const { release } = input;
  const named = new Set<string>();
  const missing = input.entries.flatMap((entry) =>
    namedFilesOf({
      entry,
      roles: input.roles,
    }).flatMap((file) => {
      named.add(file);

      return release.files.exists(`${release.folder}${SEPARATOR}${file}`)
        ? []
        : [
            {
              code: PresetsCode.MissingReleaseFile,
              details: {
                block: entry.block,
                file,
                rule: entry.rule,
              },
              path: entry.set.file,
            } satisfies PresetsFinding,
          ];
    }),
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
            ...(named.has(file)
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
