import { compareText } from '#/kernel/utils';

// The order a project reads the files of a source in, the one the Constitution's check loads its
// blocks in: by layer, then id, then folder, then the passport, the chapters by axis, the seams by
// axis and any other file, each by name. ID_END, a character below any a name holds, ends an id, so
// "ui" comes before "ui-kit".

const ID_END = '\u0001';
const CORE = 'core';
const CONTEXTS = 'contexts';
const PLATFORMS = 'platforms';
const DOMAINS = 'domains';
const SEAMS = 'with/';
const AXIS_RANK: ReadonlyMap<string, number> = new Map([
  [
    'foundation',
    0,
  ],
  [
    'architecture',
    1,
  ],
  [
    'workflow',
    2,
  ],
]);

enum Rank {
  Core = 0,
  Domain = 1,
  Platform = 2,
  Language = 3,
  Implementation = 4,
}

enum Role {
  Passport = 0,
  Chapter = 1,
  Seam = 2,
  Other = 3,
}

interface Placed {
  dir: string;
  id: string;
  rank: Rank;
}

const placeOf = (segments: readonly string[]): Placed => {
  // A split gives one segment at least, and kind falls back only for a path of one segment, which
  // it would sort apart only from a folder of the same name, one no tree holds beside the file.
  // Stryker disable next-line StringLiteral: neither fallback can change an order
  const [blocks = '', kind = '', ...rest] = segments;
  const [group = '', inner = ''] = rest;

  if (kind === CORE) {
    return {
      dir: `${blocks}/${kind}`,
      id: CORE,
      rank: Rank.Core,
    };
  }

  if (kind === CONTEXTS) {
    return {
      dir: [
        blocks,
        kind,
        group,
        inner,
      ].join('/'),
      id: inner,
      rank: group === PLATFORMS ? Rank.Platform : Rank.Language,
    };
  }

  return {
    dir: [
      blocks,
      kind,
      group,
    ].join('/'),
    id: group,
    rank: kind === DOMAINS ? Rank.Domain : Rank.Implementation,
  };
};

const keyOf = (path: string): string => {
  const placed = placeOf(path.split('/'));
  let name = path.slice(placed.dir.length + 1);
  // the folder the name starts in, '' when it is in none
  const top = name.slice(0, Math.max(name.indexOf('/'), 0));
  const axis = AXIS_RANK.get(top);
  let role = name === `${placed.id}.md` ? Role.Passport : Role.Other;

  if (axis !== undefined) {
    name = name.slice(top.length + 1);
    role = name.startsWith(SEAMS) ? Role.Seam : Role.Chapter;
    name = role === Role.Seam ? name.slice(SEAMS.length) : name;
  }

  role = name.includes('/') ? Role.Other : role;

  return `${placed.rank}${placed.id}${ID_END}${placed.dir}${ID_END}${role}${axis ?? 0}${ID_END}${name}`;
};

const inCatalogueOrder = <
  TFile extends {
    readonly path: string;
  },
>(
  files: readonly TFile[],
): readonly TFile[] =>
  files
    .map((file) => ({
      file,
      key: keyOf(file.path),
    }))
    .toSorted(
      (left, right) =>
        compareText(left.key, right.key) || compareText(left.file.path, right.file.path),
    )
    .map(({ file }) => file);

export { inCatalogueOrder };
