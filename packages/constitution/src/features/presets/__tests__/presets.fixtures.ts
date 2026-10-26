import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { createFakeProjectSource } from '#/__tests__/project-source.fake';
import { Axis, Layer, Level } from '#/kernel/constants';
import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';
import type { ModelBlock, ModelRule, ProjectWarning, RoleTerm } from '#/kernel/entities';
import {
  BlockListing,
  BlockModel,
  ConfigReadStatus,
  ProjectUnit,
  Resolution,
  TermKind,
} from '#/kernel/entities';
import { BlockId, Glob, PackPath, RuleSlug, UnitPath } from '#/kernel/value-objects';

import { createYamlPresetFileParser } from '../adapters/yaml';

// The blocks the presets' specs hold their preset files against: core, the languages, a domain, and
// the tools that read the files, each with the rules and the role terms the cases name.

interface BlockFixture {
  readonly extends?: string;
  readonly governs?: readonly string[];
  readonly id: string;
  readonly layer: Layer;
  readonly requires?: readonly string[];
}

interface RuleFixture {
  readonly axis?: Axis;
  readonly block: string;
  readonly seam?: string;
  readonly slug: string;
}

interface RoleFixture {
  readonly axis?: Axis;
  readonly block: string;
  readonly id?: string;
  readonly kind?: TermKind.Folder | TermKind.Suffix;
  readonly term: string;
}

const blockFixtures: readonly BlockFixture[] = [
  {
    id: 'core',
    layer: Layer.Core,
  },
  {
    id: 'workspace',
    layer: Layer.Domain,
  },
  {
    id: 'ui',
    layer: Layer.Domain,
  },
  {
    governs: [
      '**/*.ts',
    ],
    id: 'typescript',
    layer: Layer.Language,
  },
  {
    id: 'json',
    layer: Layer.Language,
  },
  {
    id: 'css',
    layer: Layer.Language,
  },
  {
    id: 'browser',
    layer: Layer.Platform,
  },
  {
    governs: [
      'biome.json',
    ],
    id: 'biome',
    layer: Layer.Implementation,
    requires: [
      'json',
    ],
  },
  {
    id: '_runtime',
    layer: Layer.Implementation,
  },
  {
    extends: '_runtime',
    governs: [
      'bunfig.toml',
    ],
    id: 'bun',
    layer: Layer.Implementation,
    requires: [
      'typescript',
    ],
  },
  {
    governs: [
      '.gitignore',
      '.git/**',
    ],
    id: 'git',
    layer: Layer.Implementation,
  },
  {
    id: 'lefthook',
    layer: Layer.Implementation,
  },
];

const ruleFixtures: readonly RuleFixture[] = [
  {
    block: 'core',
    slug: 'file-within-500-lines',
  },
  {
    axis: Axis.Architecture,
    block: 'core',
    slug: 'import-points-inward',
  },
  {
    axis: Axis.Workflow,
    block: 'core',
    slug: 'commit-checked-by-hooks',
  },
  {
    block: 'typescript',
    slug: 'unchecked-type-never-used',
  },
  {
    block: 'workspace',
    slug: 'unit-checked-by-its-own-tools',
  },
  {
    axis: Axis.Architecture,
    block: 'ui',
    slug: 'screens-never-fetch',
  },
  {
    block: 'css',
    seam: 'browser',
    slug: 'css-loaded-by-the-bundle',
  },
  {
    block: 'bun',
    seam: 'workspace',
    slug: 'install-settings-only-in-the-root',
  },
];

const roleFixtures: readonly RoleFixture[] = [
  {
    block: 'core',
    id: 'source',
    term: 'src/',
  },
  {
    axis: Axis.Architecture,
    block: 'core',
    id: 'gateway',
    term: 'adapters/',
  },
  {
    axis: Axis.Architecture,
    block: 'core',
    id: 'gateway-file',
    kind: TermKind.Suffix,
    term: '.adapter',
  },
  {
    block: 'typescript',
    id: 'typescript-source',
    kind: TermKind.Suffix,
    term: '.ts',
  },
  {
    block: 'git',
    id: 'ignore-file',
    kind: TermKind.Suffix,
    term: '.gitignore',
  },
  {
    block: 'core',
    term: 'docs/',
  },
];

const modelBlockOf = (block: BlockFixture): ModelBlock => ({
  ...(block.extends === undefined
    ? {}
    : {
        extends: BlockId.create(block.extends),
      }),
  governs: (block.governs ?? []).map(Glob.create),
  id: BlockId.create(block.id),
  languages: [],
  layer: block.layer,
  requires: (block.requires ?? []).map(BlockId.create),
});

const modelRuleOf = (rule: RuleFixture): ModelRule => ({
  axis: rule.axis ?? Axis.Foundation,
  block: BlockId.create(rule.block),
  level: Level.Must,
  ...(rule.seam === undefined
    ? {}
    : {
        seam: BlockId.create(rule.seam),
      }),
  slug: RuleSlug.create(rule.slug),
});

const roleOf = (role: RoleFixture): RoleTerm => ({
  axis: role.axis ?? Axis.Foundation,
  block: BlockId.create(role.block),
  ...(role.id === undefined
    ? {}
    : {
        id: role.id,
      }),
  kind: role.kind ?? TermKind.Folder,
  term: role.term,
});

const presetsModel: BlockModel = BlockModel.create({
  blocks: blockFixtures.map(modelBlockOf),
  roles: roleFixtures.map(roleOf),
  rules: ruleFixtures.map(modelRuleOf),
});

interface UnitFixture {
  readonly axes?: readonly Axis[];
  /** core and the bases of the blocks given are the case's to list */
  readonly blocks?: readonly string[];
  readonly languages?: readonly string[];
  readonly lowered?: readonly string[];
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
          'core',
        ]
      ).map(BlockId.create),
    ),
    languages: new Set((input.languages ?? []).map(BlockId.create)),
    loweredRules: new Set((input.lowered ?? []).map(RuleSlug.create)),
    name: input.name,
    packs: (input.packs ?? []).map(PackPath.create),
    path: UnitPath.create(input.path ?? ''),
  });

type Files = Readonly<Record<string, string>>;

/** The release's preset files and data, by their paths under its presets/, as absolute files. */
const releasePresets = (presets: Files): Files =>
  Object.fromEntries(
    Object.entries(presets).map(([path, text]) => [
      `${releaseFolderPath}/presets/${path}`,
      text,
    ]),
  );

/** The project's own files, by their paths from its folder, as absolute files. */
const projectFiles = (files: Files): Files =>
  Object.fromEntries(
    Object.entries(files).map(([path, text]) => [
      `${PROJECT}/${path}`,
      text,
    ]),
  );

interface ProjectFixture {
  readonly files?: Files;
  readonly links?: FakeTree['links'];
  readonly packs?: readonly string[];
  readonly units: readonly ProjectUnit[];
  readonly unreadable?: readonly string[];
  readonly warnings?: readonly ProjectWarning[];
}

/** A project of these units around the release, its files read through the fake. */
const projectOf = (
  input: ProjectFixture,
): {
  readonly files: ProjectFiles;
  readonly source: ProjectSource;
} => ({
  files: createFakeProjectFiles({
    files: input.files ?? {},
    ...(input.links === undefined
      ? {}
      : {
          links: input.links,
        }),
    ...(input.unreadable === undefined
      ? {}
      : {
          unreadable: input.unreadable,
        }),
  }),
  source: createFakeProjectSource({
    declaration: {
      packs: (input.packs ?? []).map(PackPath.create),
      resolution: Resolution.create({
        active: [],
        blocks: [],
        listing: BlockListing.create({
          overrides: [],
          repository: [],
          units: [],
        }),
        model: presetsModel,
        musts: [],
        units: input.units,
        warnings: input.warnings ?? [],
      }),
      status: ConfigReadStatus.Parsed,
    },
    place: projectPlace,
  }),
});

const presetFileParser = createYamlPresetFileParser();

export { PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';

export type { Files };
export { presetFileParser, presetsModel, projectFiles, projectOf, releasePresets, unitOf };
