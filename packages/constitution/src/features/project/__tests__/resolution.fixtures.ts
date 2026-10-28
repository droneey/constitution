import type { Layer, LoweredLevel } from '#/kernel/constants';
import { Axis } from '#/kernel/constants';
import type { ActiveBlock, BlockModel, Lowering, MustRule, RoleTerm } from '#/kernel/entities';
import { ConfigReadStatus, FileReadStatus, ProjectUnit } from '#/kernel/entities';
import {
  AbsolutePath,
  BlockId,
  BlockSource,
  coreBlockId,
  Glob,
  PackPath,
  RuleSlug,
  repositoryUnit,
  UnitPath,
} from '#/kernel/value-objects';

import type {
  BlockListing,
  BlockSetSource,
  DeclaredUnit,
  ListedBlock,
  ListedFiles,
  ListedOverride,
  ProjectConfig,
  SourceFile,
  UnitEntry,
  UnitListing,
} from '../domain/entities';
import { SourceStatus, UnitEntryKind } from '../domain/entities';
import type { BlockSetBlockFixture, BlockSetRuleFixture } from './block-set.fixtures';
import { blockSetBlockOf, blockSetRuleOf } from './block-set.fixtures';
import type { BlockFixture } from './project.fixtures';
import { blockFilesOf, parsers } from './project.fixtures';

const ROOT = '/source';
const RELEASE_WHERE = '/work/project/.droneey/constitution';
const today = Temporal.PlainDate.from('2026-06-15');
const CORE_FOLDER = 'blocks/core/';
const CORE_AS_DOMAIN = 'blocks/domains/core/';

const KEYS: Readonly<Record<string, string>> = {
  axes: 'axes: [architecture, workflow]',
  domains: 'domains: []',
  platforms: 'platforms: []',
  languages: 'languages: []',
  implementations: 'implementations: []',
  packs: 'packs: []',
  overrides: 'overrides: []',
} as const;

const yamlOf = (keys: Readonly<Record<string, string>> = {}): string =>
  `${Object.values({
    ...KEYS,
    ...keys,
  }).join('\n')}\n`;

const unitConfigOf = (text: string): DeclaredUnit['config'] => {
  const read = parsers().configParser.parse(text);

  if (read.status === ConfigReadStatus.Unparsed) {
    throw new Error(`constitution.yaml fails at lines ${read.lines.join(', ')}`);
  }

  return read.config;
};

const parsedOf = (text: string, members: Readonly<Record<string, string>> = {}): ProjectConfig => ({
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
  unread: [],
});

const configOf = (
  keys: Readonly<Record<string, string>> = {},
  members: Readonly<Record<string, Readonly<Record<string, string>>>> = {},
): ProjectConfig =>
  parsedOf(
    yamlOf(keys),
    Object.fromEntries(
      Object.entries(members).map(([path, memberKeys]) => [
        path,
        yamlOf(memberKeys),
      ]),
    ),
  );

const filesOf = (blocks: readonly BlockFixture[]): readonly SourceFile[] =>
  Object.entries(
    blockFilesOf({
      blocks,
      root: ROOT,
    }),
  ).map(([path, text]) => ({
    path: path.slice(ROOT.length + 1),
    status: FileReadStatus.Read,
    text,
  }));

interface SourceFixture {
  readonly blocks?: readonly BlockFixture[];
  readonly core?: Omit<BlockFixture, 'folder' | 'id'>;
  readonly source?: string;
}

const sourceOf = (input: SourceFixture = {}): BlockSetSource => {
  const pack = input.source;
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
    shownFolderPath:
      pack === undefined ? AbsolutePath.create(RELEASE_WHERE) : PackPath.create(pack),
    source: BlockSource.create(pack === undefined ? undefined : PackPath.create(pack)),
    status: SourceStatus.Listed,
  };
};

interface UnitFixture {
  readonly axes?: readonly Axis[];
  readonly blocks?: readonly string[];
  readonly languages?: readonly string[];
  readonly loweredRules?: readonly string[];
  readonly name?: string;
  readonly packs?: readonly string[];
  readonly path?: string;
}

const unitOf = (input: UnitFixture = {}): ProjectUnit =>
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
    languages: new Set((input.languages ?? []).map(BlockId.create)),
    loweredRules: new Set((input.loweredRules ?? []).map(RuleSlug.create)),
    name: input.name,
    packs: (input.packs ?? []).map(PackPath.create),
    path: UnitPath.create(input.path ?? ''),
  });

interface ModelFixture {
  readonly blocks?: readonly BlockSetBlockFixture[];
  readonly roles?: readonly RoleTerm[];
  readonly rules?: readonly BlockSetRuleFixture[];
}

const modelOf = (input: ModelFixture = {}): BlockModel => ({
  blocks: (input.blocks ?? []).map(blockSetBlockOf),
  roles: input.roles ?? [],
  rules: (input.rules ?? []).map(blockSetRuleOf),
});

interface ActiveBlockFixture {
  readonly files: readonly string[];
  readonly governs?: readonly string[];
  readonly id: string;
  readonly unit?: string;
}

const activeOf = (input: ActiveBlockFixture): ActiveBlock => ({
  files: input.files,
  governs: (input.governs ?? []).map(Glob.create),
  id: BlockId.create(input.id),
  unit: UnitPath.create(input.unit ?? ''),
});

interface LoweringFixture {
  readonly level: LoweredLevel;
  readonly unit?: string;
  readonly via?: string;
}

const loweringOf = (input: LoweringFixture): Lowering => ({
  level: input.level,
  unit: UnitPath.create(input.unit ?? ''),
  ...(input.via === undefined
    ? {}
    : {
        via: RuleSlug.create(input.via),
      }),
});

interface MustRuleFixture {
  readonly block: string;
  readonly lowerings?: readonly Lowering[];
  readonly slug: string;
}

const mustOf = (input: MustRuleFixture): MustRule => ({
  block: BlockId.create(input.block),
  lowerings: input.lowerings ?? [],
  slug: RuleSlug.create(input.slug),
});

interface ListedFilesFixture {
  readonly axis: Axis;
  readonly chapters?: readonly string[];
  readonly seams?: readonly string[];
}

const filesOn = (input: ListedFilesFixture): ListedFiles => ({
  axis: input.axis,
  chapters: input.chapters ?? [],
  seams: (input.seams ?? []).map(BlockId.create),
});

interface ListedBlockFixture {
  readonly files?: readonly ListedFiles[];
  readonly id: string;
  readonly layer: Layer;
  readonly pack?: string;
  readonly summary?: string | undefined;
}

const listedOf = (input: ListedBlockFixture): ListedBlock => {
  const summary = 'summary' in input ? input.summary : `The ${input.id} block.`;

  return {
    files: input.files ?? [],
    id: BlockId.create(input.id),
    layer: input.layer,
    source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
    ...(summary === undefined
      ? {}
      : {
          summary,
        }),
  };
};

const ownEntryOf = (block: ListedBlock): UnitEntry => ({
  block,
  kind: UnitEntryKind.Own,
});

interface AddedEntryFixture {
  readonly files: readonly ListedFiles[];
  readonly id: string;
  readonly layer: Layer;
}

const addedEntryOf = (input: AddedEntryFixture): UnitEntry => ({
  files: input.files,
  id: BlockId.create(input.id),
  kind: UnitEntryKind.Added,
  layer: input.layer,
});

interface UnitListingFixture {
  readonly entries?: readonly UnitEntry[];
  readonly leftOutAxes?: readonly Axis[];
  readonly leftOutBlocks?: readonly string[];
  readonly unit: string;
}

const unitListingOf = (input: UnitListingFixture): UnitListing => ({
  entries: input.entries ?? [],
  leftOutAxes: input.leftOutAxes ?? [],
  leftOutBlocks: (input.leftOutBlocks ?? []).map(BlockId.create),
  unit: UnitPath.create(input.unit),
});

interface ListedOverrideFixture {
  readonly level: LoweredLevel;
  readonly rule: string;
  readonly unit?: string;
  readonly until?: string;
}

const listedOverrideOf = (input: ListedOverrideFixture): ListedOverride => ({
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

export {
  activeOf,
  addedEntryOf,
  configOf,
  filesOn,
  listedOf,
  listedOverrideOf,
  listingOf,
  loweringOf,
  modelOf,
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
