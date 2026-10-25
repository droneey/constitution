import type { Layer, LoweredLevel } from '#/kernel/constants';
import { Axis } from '#/kernel/constants';
import type {
  BlockListing,
  ListedBlock,
  ListedFiles,
  ListedOverride,
  UnitEntry,
  UnitListing,
} from '#/kernel/entities';
import {
  ActiveBlock,
  ConfigReadStatus,
  Lowering,
  MustRule,
  ProjectUnit,
  UnitEntryKind,
} from '#/kernel/entities';
import type { ProjectFailure } from '#/kernel/errors';
import { isProjectError } from '#/kernel/errors';
import {
  BlockId,
  BlockSource,
  coreBlockId,
  Glob,
  PackPath,
  RuleSlug,
  repositoryUnit,
  UnitPath,
} from '#/kernel/value-objects';

import type { BlockFixture } from '../../../../../../../__tests__/project.fixtures';
import { blockFilesOf, parsers } from '../../../../../../../__tests__/project.fixtures';
import type {
  CatalogueSource,
  ProjectConfig,
  UnitConfig,
  UnreadMember,
} from '../../../../../../entities';

// The sources and the constitution.yaml a resolution reads, built from blocks and the keys of a
// declaration.

const ROOT = '/source';
const RELEASE_WHERE = '/work/project/.droneey/constitution';
const today = Temporal.PlainDate.from('2026-06-15');
const CORE_FOLDER = 'blocks/core/';
const CORE_AS_DOMAIN = 'blocks/domains/core/';

// Every key the repository's constitution.yaml needs, each written so it warns of nothing.
const KEYS: Readonly<Record<string, string>> = {
  axes: 'axes: [architecture, workflow]',
  domains: 'domains: []',
  platforms: 'platforms: []',
  languages: 'languages: []',
  implementations: 'implementations: []',
  packs: 'packs: []',
  check: 'check: null',
  overrides: 'overrides: []',
} as const;

// Every key a member's constitution.yaml needs: the repository's but the check.
const memberKeyLines: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(KEYS).filter(([key]) => key !== 'check'),
);

const writtenOf = (keys: Readonly<Record<string, string>>): string =>
  `${Object.values(keys).join('\n')}\n`;

// The repository's constitution.yaml of every key, the given ones written as given.
const yamlOf = (keys: Readonly<Record<string, string>> = {}): string =>
  writtenOf({
    ...KEYS,
    ...keys,
  });

// A member's constitution.yaml of every key, the given ones written as given.
const memberYamlOf = (keys: Readonly<Record<string, string>> = {}): string =>
  writtenOf({
    ...memberKeyLines,
    ...keys,
  });

// What the real parser reads of a constitution.yaml that parses.
const unitConfigOf = (text: string): UnitConfig => {
  const read = parsers().configParser.parse(text);

  if (read.status === ConfigReadStatus.Unparsed) {
    throw new Error(`constitution.yaml stops at line ${read.line}`);
  }

  return read.config;
};

// The declaration of a repository whose constitution.yaml is the text given, and of its members,
// each by its path and its own text.
const parsedOf = (
  text: string,
  members: Readonly<Record<string, string>> = {},
  unread: readonly UnreadMember[] = [],
): ProjectConfig => ({
  units: [
    {
      config: unitConfigOf(text),
      path: repositoryUnit,
    },
    ...Object.entries(members).map(([path, written]) => ({
      config: unitConfigOf(written),
      path: UnitPath.create(path),
    })),
  ],
  unread,
});

// The declaration of a repository of the keys given, and of its members, each of the keys given.
const configOf = (
  keys: Readonly<Record<string, string>> = {},
  members: Readonly<Record<string, Readonly<Record<string, string>>>> = {},
): ProjectConfig =>
  parsedOf(
    yamlOf(keys),
    Object.fromEntries(
      Object.entries(members).map(([path, memberKeys]) => [
        path,
        memberYamlOf(memberKeys),
      ]),
    ),
  );

// The files of blocks, by their path from the source's folder.
const filesOf = (blocks: readonly BlockFixture[]): NonNullable<CatalogueSource['files']> =>
  Object.entries(
    blockFilesOf({
      blocks,
      root: ROOT,
    }),
  ).map(([path, text]) => ({
    path: path.slice(ROOT.length + 1),
    text,
  }));

// A source of the blocks given: the Constitution's by default, with core, or a pack's.
const sourceOf = (
  input: {
    blocks?: readonly BlockFixture[];
    // core's rules, globs and more files
    core?: Omit<BlockFixture, 'folder' | 'id'>;
    source?: string;
  } = {},
): CatalogueSource => {
  const pack = input.source;
  // core is written as a domain, then moved to its own folder
  const core = filesOf([
    {
      ...input.core,
      id: coreBlockId,
    },
  ]).map((file) => ({
    ...file,
    path: `${CORE_FOLDER}${file.path.slice(CORE_AS_DOMAIN.length)}`,
  }));

  return {
    files: [
      ...(pack === undefined ? core : []),
      ...filesOf(input.blocks ?? []),
    ],
    source: BlockSource.create(pack === undefined ? undefined : PackPath.create(pack)),
    where: pack ?? RELEASE_WHERE,
  };
};

// A unit of the repository with core alone on every axis, unless the case gives another.
const unitOf = (
  input: {
    axes?: readonly Axis[];
    blocks?: readonly string[];
    loweredRules?: readonly string[];
    path?: string;
  } = {},
): ProjectUnit =>
  ProjectUnit.create({
    axes: input.axes ?? [
      Axis.Foundation,
      Axis.Architecture,
      Axis.Workflow,
    ],
    blocks: new Set(
      (
        input.blocks ?? [
          coreBlockId,
        ]
      ).map(BlockId.create),
    ),
    loweredRules: new Set((input.loweredRules ?? []).map(RuleSlug.create)),
    path: UnitPath.create(input.path ?? ''),
  });

// An active block of a unit, the repository's unless the case names another.
const activeOf = (input: {
  files: readonly string[];
  governs?: readonly string[];
  id: string;
  unit?: string;
}): ActiveBlock =>
  ActiveBlock.create({
    files: input.files,
    governs: (input.governs ?? []).map(Glob.create),
    id: BlockId.create(input.id),
    unit: UnitPath.create(input.unit ?? ''),
  });

// How an override lowers a rule: in the repository unless the case names a unit, and directly
// unless it names the rule it lowers through.
const loweringOf = (input: { level: LoweredLevel; unit?: string; via?: string }): Lowering =>
  Lowering.create({
    level: input.level,
    unit: UnitPath.create(input.unit ?? ''),
    ...(input.via === undefined
      ? {}
      : {
          via: RuleSlug.create(input.via),
        }),
  });

const mustOf = (input: {
  block: string;
  lowerings?: readonly Lowering[];
  slug: string;
}): MustRule =>
  MustRule.create({
    block: BlockId.create(input.block),
    lowerings: input.lowerings ?? [],
    slug: RuleSlug.create(input.slug),
  });

// A block of the catalogue as a resolution names it.
const catalogueEntryOf = (
  id: string,
  layer: Layer,
): {
  id: BlockId;
  layer: Layer;
} => ({
  id: BlockId.create(id),
  layer,
});

// What a unit reads of a block on an axis.
const filesOn = (input: {
  axis: Axis;
  chapters?: readonly string[];
  seams?: readonly string[];
}): ListedFiles => ({
  axis: input.axis,
  chapters: input.chapters ?? [],
  seams: (input.seams ?? []).map(BlockId.create),
});

// A block of the list, the release's and summarised as the fixtures write it unless the case says.
const listedOf = (input: {
  files?: readonly ListedFiles[];
  id: string;
  layer: Layer;
  pack?: string;
}): ListedBlock => ({
  files: input.files ?? [],
  id: BlockId.create(input.id),
  layer: input.layer,
  source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
  summary: `The ${input.id} block.`,
});

const ownEntryOf = (block: ListedBlock): UnitEntry => ({
  block,
  kind: UnitEntryKind.Own,
});

const addedEntryOf = (input: {
  files: readonly ListedFiles[];
  id: string;
  layer: Layer;
}): UnitEntry => ({
  files: input.files,
  id: BlockId.create(input.id),
  kind: UnitEntryKind.Added,
  layer: input.layer,
});

const unitListingOf = (input: {
  entries?: readonly UnitEntry[];
  leftOutAxes?: readonly Axis[];
  leftOutBlocks?: readonly string[];
  unit: string;
}): UnitListing => ({
  entries: input.entries ?? [],
  leftOutAxes: input.leftOutAxes ?? [],
  leftOutBlocks: (input.leftOutBlocks ?? []).map(BlockId.create),
  unit: UnitPath.create(input.unit),
});

const listedOverrideOf = (input: {
  level: LoweredLevel;
  rule: string;
  unit?: string;
  until?: string;
}): ListedOverride => ({
  level: input.level,
  rule: RuleSlug.create(input.rule),
  unit: UnitPath.create(input.unit ?? ''),
  ...(input.until === undefined
    ? {}
    : {
        until: Temporal.PlainDate.from(input.until),
      }),
});

const listingOf = (input: Partial<BlockListing> = {}): BlockListing => ({
  overrides: input.overrides ?? [],
  repository: input.repository ?? [],
  units: input.units ?? [],
});

// A Requirements table answering each requirement as met or not.
const requirementsOf = (answers: Readonly<Record<string, string>>): string =>
  [
    '## Requirements',
    '',
    '| Requirement | How | Met |',
    '|---|---|---|',
    ...Object.entries(answers).map(
      ([requirement, met]) => `| \`${requirement}\` | A way. | ${met} |`,
    ),
    '',
  ].join('\n');

interface Failure {
  // the failure of the read it stopped at, where one was
  readonly cause: unknown;
  readonly code: ProjectFailure;
  readonly line: number | undefined;
  readonly path: string;
}

// The ProjectError an act throws, as its fields; undefined when it throws none.
const failureOf = (act: () => unknown): Failure | undefined => {
  try {
    act();

    return undefined;
  } catch (error) {
    if (!isProjectError(error)) {
      throw error;
    }

    return {
      cause: error.cause,
      code: error.code,
      line: error.details.line,
      path: error.details.path,
    };
  }
};

export {
  activeOf,
  addedEntryOf,
  catalogueEntryOf,
  configOf,
  failureOf,
  filesOn,
  listedOf,
  listedOverrideOf,
  listingOf,
  loweringOf,
  memberYamlOf,
  mustOf,
  ownEntryOf,
  parsedOf,
  requirementsOf,
  sourceOf,
  today,
  unitListingOf,
  unitOf,
  yamlOf,
};
