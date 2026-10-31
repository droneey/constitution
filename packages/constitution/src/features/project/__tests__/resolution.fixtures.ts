import type { Layer, LoweredLevel } from '#/kernel/constants';
import { Axis } from '#/kernel/constants';
import type {
  ActiveBlock,
  BlockModel,
  CoreFiles,
  Lowering,
  MustRule,
  RoleTerm,
  SourcedFile,
} from '#/kernel/entities';
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
  SourceKind,
  UnitPath,
} from '#/kernel/value-objects';

import type {
  BlockListing,
  BlockSetSource,
  DeclaredUnit,
  ListedBlock,
  ProjectConfig,
  SourceFile,
  UnitBlock,
  UnitListing,
} from '../domain/entities';
import { SourceStatus } from '../domain/entities';
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

interface SourcedFilesFixture {
  readonly files: readonly string[];
  readonly source?: SourceKind;
}

const sourcedFilesOf = (input: SourcedFilesFixture): readonly SourcedFile[] =>
  input.files.map((path) => ({
    path,
    source: input.source ?? SourceKind.Release,
  }));

interface ActiveBlockFixture extends SourcedFilesFixture {
  readonly governs?: readonly string[];
  readonly id: string;
  readonly unit?: string;
}

const activeOf = (input: ActiveBlockFixture): ActiveBlock => ({
  files: sourcedFilesOf(input),
  governs: (input.governs ?? []).map(Glob.create),
  id: BlockId.create(input.id),
  unit: UnitPath.create(input.unit ?? ''),
});

interface CoreFilesFixture {
  readonly files: readonly string[];
  readonly unit?: string;
}

const coreFilesOf = (input: CoreFilesFixture): CoreFiles => ({
  files: sourcedFilesOf(input),
  unit: UnitPath.create(input.unit ?? ''),
});

interface LoweringFixture {
  readonly level: LoweredLevel;
  readonly reason?: string;
  readonly unit?: string;
  readonly via?: string;
}

const loweringOf = (input: LoweringFixture): Lowering => ({
  level: input.level,
  reason: input.reason ?? 'A reason.',
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

interface UnitBlockFixture {
  readonly id: string;
  readonly pack?: string;
}

const unitBlockOf = (input: UnitBlockFixture): UnitBlock => ({
  id: BlockId.create(input.id),
  source: BlockSource.create(input.pack === undefined ? undefined : PackPath.create(input.pack)),
});

interface ListedBlockFixture extends UnitBlockFixture {
  readonly layer: Layer;
}

const listedOf = (input: ListedBlockFixture): ListedBlock => ({
  ...unitBlockOf(input),
  layer: input.layer,
});

interface UnitListingFixture {
  readonly leftOutAxes?: readonly Axis[];
  readonly leftOutBlocks?: readonly string[];
  readonly own?: readonly UnitBlockFixture[];
  readonly unit: string;
}

const unitListingOf = (input: UnitListingFixture): UnitListing => ({
  leftOutAxes: input.leftOutAxes ?? [],
  leftOutBlocks: (input.leftOutBlocks ?? []).map(BlockId.create),
  own: (input.own ?? []).map(unitBlockOf),
  unit: UnitPath.create(input.unit),
});

const listingOf = (input: Partial<BlockListing> = {}): BlockListing => ({
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
  configOf,
  coreFilesOf,
  listedOf,
  listingOf,
  loweringOf,
  modelOf,
  mustOf,
  parsedOf,
  requirementsOf,
  sourceOf,
  today,
  unitListingOf,
  unitOf,
  yamlOf,
};
