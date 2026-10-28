import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { Axis, Layer, Level } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ModelBlock, ModelRule, ProjectWarning, RoleTerm } from '#/kernel/entities';
import { BlockModel, ProjectUnit, TermKind } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import {
  BlockId,
  Glob,
  PackPath,
  RuleSlug,
  UnitPath,
  UnitRelativePath,
} from '#/kernel/value-objects';

import { createYamlPresetFileParser } from '../adapters/yaml';
import type { ProjectReader } from '../domain/contracts';
import type { Lock, LockRecord, PresetsProject } from '../domain/entities';
import { ProjectRead, ProjectReadStatus } from '../domain/entities';

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
  readonly seam?: string;
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
  {
    id: 'nestjs',
    layer: Layer.Implementation,
    requires: [
      'typescript',
    ],
  },
  {
    id: 'nx',
    layer: Layer.Implementation,
    requires: [
      'typescript',
      'workspace',
    ],
  },
  {
    id: 'docker',
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
  {
    block: 'git',
    seam: 'bun',
    slug: 'lock-file-committed',
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
    block: 'typescript',
    id: 'declaration-cache',
    seam: 'workspace',
    term: '.declarations/',
  },
  {
    block: 'nestjs',
    id: 'nest-module',
    kind: TermKind.Suffix,
    term: '.module',
  },
  {
    block: 'docker',
    id: 'ignore-file',
    kind: TermKind.Suffix,
    term: '.dockerignore',
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
  isAbstract: false,
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
  ...(role.seam === undefined
    ? {}
    : {
        seam: BlockId.create(role.seam),
      }),
  term: role.term,
});

const presetsModel: BlockModel = BlockModel.create({
  blocks: blockFixtures.map(modelBlockOf),
  roles: roleFixtures.map(roleOf),
  rules: ruleFixtures.map(modelRuleOf),
});

interface UnitFixture {
  readonly axes?: readonly Axis[];
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

const releasePresets = (presets: Files): Files =>
  Object.fromEntries(
    Object.entries(presets).map(([path, text]) => [
      `${releaseFolderPath}/presets/${path}`,
      text,
    ]),
  );

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

const projectOf = (
  input: ProjectFixture,
): {
  readonly files: ProjectFiles;
  readonly project: PresetsProject;
  readonly reader: ProjectReader;
} => {
  const project: PresetsProject = {
    ...projectPlace,
    model: presetsModel,
    packs: (input.packs ?? []).map(PackPath.create),
    units: input.units,
    warnings: input.warnings ?? [],
  };

  return {
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
    project,
    reader: {
      open: (startFolderPath: AbsolutePath): ProjectRead<PresetsProject> =>
        startFolderPath === projectPlace.repositoryFolderPath ||
        startFolderPath.startsWith(`${projectPlace.repositoryFolderPath}/`)
          ? ProjectRead.opened(project)
          : {
              status: ProjectReadStatus.NoProject,
            },
    },
  };
};

const answerOf = <TAnswer>(read: ProjectRead<TAnswer>): TAnswer => {
  if (read.status !== ProjectReadStatus.Opened) {
    throw new Error(`the project did not open: ${read.status}`);
  }

  return read.answer;
};

const presetFileParser = createYamlPresetFileParser();

const lockOf = (records: Readonly<Record<string, LockRecord>>): Lock =>
  Object.fromEntries(
    Object.entries(records).map(([filePath, record]) => [
      UnitRelativePath.create(filePath),
      record,
    ]),
  );

export { PROJECT } from '#/__tests__/project-place.fixtures';

export type { Files };
export {
  answerOf,
  lockOf,
  presetFileParser,
  presetsModel,
  projectFiles,
  projectOf,
  releasePresets,
  unitOf,
};
