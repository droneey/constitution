import { PRESETS_FOLDER, RELEASE_FOLDER } from '#/kernel/constants';
import { joinPaths } from '#/kernel/utils';
import { PresetPartPath, SourceKind } from '#/kernel/value-objects';

import type { SourceFile } from '../../../../entities';
import { Parts } from '../../../../entities';

// How a configuration names the parts of a tool: by the path of the release, from any folder, or by
// the path of a pack from the folder the configuration serves, as "<scope>/<axis>/<name>", in
// comments too or in code alone.

const releaseFolderEnd = `${RELEASE_FOLDER}/`;
const presetsPrefix = `${PRESETS_FOLDER}/`;
const CURRENT = '.';
const PARENT = '..';
const SEPARATOR = '/';
const BINDINGS = 'bindings.yaml';
// the first character that ends a path, or the line's end
const PATH_END = /[^\w./-]|$/;
// the path a text ends with
const PATH_TAIL = /[\w./-]*$/;
const COMMENT = /^[ \t]*(#|\/\/|\/\*|\*)/;

interface Naming {
  /** the packs that hold presets or templates, each by its path from the repository */
  readonly packs: ReadonlySet<string>;
  readonly parts: Parts;
}

const isComment = (line: string): boolean => COMMENT.test(line);

// A path from the repository written one way: no ./, no .. it can take back, no trailing /.
const placeOf = (path: string): string =>
  joinPaths([
    path,
    CURRENT,
  ]);

const segmentsOf = (path: string): readonly string[] =>
  placeOf(path)
    .split(SEPARATOR)
    .filter((segment) => segment !== CURRENT);

// The path of a place from a folder, both by their paths from the repository.
const pathFrom = (input: { folder: string; place: string }): string => {
  const from = segmentsOf(input.folder);
  const to = segmentsOf(input.place);
  const parted = from.findIndex((segment, index) => segment !== to[index]);
  const shared = parted === -1 ? from.length : parted;

  return joinPaths([
    ...from.slice(shared).map(() => PARENT),
    ...to.slice(shared),
  ]);
};

// Whether the text before "presets/" ends with the release's path, or with a path that leads from
// the folder to a pack.
const isAnchored = (input: { before: string; folder: string; naming: Naming }): boolean =>
  input.before.endsWith(releaseFolderEnd) ||
  input.naming.packs.has(
    placeOf(`${input.folder}${SEPARATOR}${input.before.slice(input.before.search(PATH_TAIL))}`),
  );

// The path a configuration in the folder names a part's file by.
const namePathOf = (input: { file: SourceFile; folder: string }): string =>
  `${
    input.file.source.kind === SourceKind.Release
      ? RELEASE_FOLDER
      : pathFrom({
          folder: input.folder,
          place: input.file.source.pack,
        })
  }${SEPARATOR}${input.file.path}`;

// The parts a line names after each place it holds the prefix of a scope's tool; the line is cut at
// each place, so no index can lead the search back to a place it has passed.
const namedInLine = (input: {
  folder: string;
  line: string;
  naming: Naming;
  prefix: string;
  scope: string;
}): readonly string[] => {
  const pieces = input.line.split(input.prefix);

  return pieces.slice(1).flatMap((rest, index) => {
    const token = rest.slice(0, rest.search(PATH_END));
    const slash = token.indexOf('/');
    const file = token.slice(slash + 1);
    const name = PresetPartPath.partNameOf(file);

    return isAnchored({
      before: pieces.slice(0, index + 1).join(input.prefix),
      folder: input.folder,
      naming: input.naming,
    }) &&
      slash !== -1 &&
      !file.includes('/') &&
      file !== BINDINGS &&
      name !== ''
      ? [
          `${input.scope}/${token.slice(0, slash)}/${name}`,
        ]
      : [];
  });
};

// The parts of tool a text in the folder names, as <scope>/<axis>/<name>, each once in the order
// found.
const namedOf = (input: {
  folder: string;
  isCodeOnly: boolean;
  naming: Naming;
  text: string;
  tool: string;
}): readonly string[] => {
  const scopes = Parts.scopesOf(input.naming.parts, input.tool);
  const named = new Set<string>();

  for (const line of input.text.split('\n')) {
    if (input.isCodeOnly && isComment(line)) {
      continue;
    }

    for (const scope of scopes) {
      for (const part of namedInLine({
        folder: input.folder,
        line,
        naming: input.naming,
        prefix: `${presetsPrefix}${scope}/${input.tool}/`,
        scope,
      })) {
        named.add(part);
      }
    }
  }

  return [
    ...named,
  ];
};

export type { Naming };
export { isAnchored, isComment, namedOf, namePathOf, presetsPrefix };
