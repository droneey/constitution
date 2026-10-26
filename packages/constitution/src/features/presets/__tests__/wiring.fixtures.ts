import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { createFakeProjectSource } from '#/__tests__/project-source.fake';
import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';
import { Axis, Layer } from '#/kernel/constants';
import type { ProjectWarning, WarningDetails } from '#/kernel/entities';
import {
  BlockListing,
  BlockModel,
  ConfigReadStatus,
  ProjectUnit,
  Resolution,
  WarningKind,
} from '#/kernel/entities';
import { BlockId, PackPath, RuleSlug, UnitPath } from '#/kernel/value-objects';

import { createConfigurationParser } from '../adapters/configuration';
import type { ConfigurationParser } from '../domain/contracts';
import type { PresetsPorts } from '../domain/use-cases/queries/shared/presets-ports';
import type { WiringInput } from '../domain/use-cases/queries/shared/wiring';

// A project's wiring as the check reads it: the release's presets and templates, the project's
// files and the units it resolves to, each block active in the repository by default.

type Files = Readonly<Record<string, string>>;

interface BlockOf {
  readonly id: string;
  readonly layer: Layer;
}

const BLOCKS: readonly BlockOf[] = [
  {
    id: 'core',
    layer: Layer.Core,
  },
  {
    id: 'workspace',
    layer: Layer.Domain,
  },
  {
    id: 'typescript',
    layer: Layer.Language,
  },
  {
    id: 'python',
    layer: Layer.Language,
  },
  {
    id: 'biome',
    layer: Layer.Implementation,
  },
  {
    id: 'dependency-cruiser',
    layer: Layer.Implementation,
  },
  {
    id: 'ruff',
    layer: Layer.Implementation,
  },
  {
    id: 'vulture',
    layer: Layer.Implementation,
  },
  {
    id: 'import-linter',
    layer: Layer.Implementation,
  },
  {
    id: 'osv-scanner',
    layer: Layer.Implementation,
  },
] as const;

const implementationOf = (id: string): BlockOf => ({
  id,
  layer: Layer.Implementation,
});

const COPIED = '# from <parts>\n<copied parts>\n# end <parts>\n';

// Biome's parts, which a file takes by their paths; dependency-cruiser's, which a workspace's root
// takes only partly; Ruff's chain, which a file names by a marker; vulture's and import-linter's
// parts, which a file copies under a marker; OSV-Scanner's in a task's line; a template that takes
// no part. The files are listed out of order, as a folder may list them.
const RELEASE: Files = {
  'templates/project/python/vulture/pyproject.toml': COPIED,
  'templates/project/typescript/biome/biome.json': '{ "extends": ["<parts>"] }\n',
  'templates/project/python/ruff/pyproject.toml':
    '# from <parts>\n[tool.ruff]\nextend = "<chain end>"\n',
  'templates/project/common/biome/biome.json': '{ "extends": ["<parts>"] }\n',
  'templates/project/python/import-linter/pyproject.toml': COPIED,
  'templates/project/python/python/pyproject.toml': '[project]\nname = "<name>"\n',
  'templates/project/typescript/dependency-cruiser/.dependency-cruiser.mjs':
    "export default { extends: ['<parts>'] };\n",
  'templates/project/common/osv-scanner/mise.toml':
    '[tasks."audit:check"]\nrun = "osv-scanner --licenses=<parts>"\n',
  'presets/typescript/biome/foundation/typescript.jsonc': '{}\n',
  'presets/typescript/biome/foundation/react-dom.jsonc': '{}\n',
  'presets/typescript/biome/foundation/self.jsonc': '{}\n',
  'presets/typescript/biome/foundation/core.jsonc': '{}\n',
  'presets/common/biome/foundation/self.jsonc': '{}\n',
  'presets/typescript/dependency-cruiser/architecture/workspace.mjs': 'export default {};\n',
  'presets/typescript/dependency-cruiser/architecture/core.mjs': 'export default {};\n',
  'presets/typescript/dependency-cruiser/foundation/self.mjs': 'export default {};\n',
  'presets/python/ruff/foundation/fastapi.toml': 'extend = "pytest.toml"\n',
  'presets/python/ruff/foundation/pytest.toml': 'extend = "core.toml"\n',
  'presets/python/ruff/foundation/core.toml': 'extend = "self.toml"\n',
  'presets/python/ruff/foundation/self.toml': 'line-length = 100\n',
  'presets/python/vulture/foundation/core.toml':
    '[tool.vulture]\npaths = ["src"]\n\nmin_confidence = 60\n',
  'presets/python/import-linter/foundation/core.toml':
    '[[tool.importlinter.contracts]]\nname = "no-cycle"\nancestors = ["<package>"]\n',
  'presets/common/osv-scanner/foundation/core.txt': 'MIT\n',
} as const;

const RELEASE_PATH = '.droneey/constitution';

// A part as a project names it, by the release's path.
const part = (path: string): string => `${RELEASE_PATH}/presets/${path}`;

const template = (path: string): string => `${RELEASE_PATH}/templates/project/${path}`;

const biomeJson = (paths: readonly string[]): string =>
  `${JSON.stringify(
    {
      extends: paths.map(part),
    },
    undefined,
    2,
  )}\n`;

const BIOME_PARTS: readonly string[] = [
  'common/biome/foundation/self.jsonc',
  'typescript/biome/foundation/self.jsonc',
  'typescript/biome/foundation/core.jsonc',
  'typescript/biome/foundation/typescript.jsonc',
] as const;

const cruiserConfig = (paths: readonly string[]): string =>
  `export default { extends: [${paths.map((path) => `'${part(path)}'`).join(', ')}] };\n`;

const rootCruiser = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);

const packageCruiser = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/core.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);

const ruffConfig = (links: readonly string[], end: string): string =>
  `# from ${links.map((link) => part(`python/ruff/foundation/${link}.toml`)).join(', ')}\n[tool.ruff]\nextend = "${part(`python/ruff/foundation/${end}.toml`)}"\n`;

const vulturePart = part('python/vulture/foundation/core.toml');
const importLinter = part('python/import-linter/foundation/core.toml');

// vulture's part copied under its marker, with a setting of the project's own after it.
const vultureCopy = (lines: string): string =>
  `# from ${vulturePart}\n${lines}# end ${vulturePart}\nignore_names = ["main"]\n`;

const vultureSection = vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 60\n');

const importLinterCopy = `# from ${importLinter}\n[[tool.importlinter.contracts]]\nname = "no-cycle"\nancestors = ["shop"]\n# end ${importLinter}\n`;

const osvTask = `[tasks."audit:check"]\nrun = "osv-scanner --licenses=${part('common/osv-scanner/foundation/core.txt')}"\n`;

const ruffSection = ruffConfig(
  [
    'self',
    'core',
  ],
  'core',
);

const pyproject = `${ruffSection}\n${vultureSection}\n${importLinterCopy}`;

// A file for every tool the repository's blocks make active but Biome, each taking its parts.
const UNBIOMED: Files = {
  '.dependency-cruiser.mjs': rootCruiser,
  'mise.toml': osvTask,
  'pyproject.toml': pyproject,
} as const;

// A file for every tool the repository's blocks make active, each taking its parts.
const wired: Files = {
  ...UNBIOMED,
  'biome.json': biomeJson(BIOME_PARTS),
};

interface UnitFixture {
  readonly axes?: readonly Axis[];
  // the repository's blocks by default
  readonly blocks?: readonly string[];
  readonly lowered?: readonly string[];
  readonly path?: string;
}

interface WiringFixture {
  readonly blocks?: readonly BlockOf[];
  // links of the project, by their path from its folder, each to the folder it names from there
  readonly links?: Readonly<Record<string, string>>;
  // the packs the units list, each by its path from the repository
  readonly packs?: readonly string[];
  // the project's files, by their path from its folder; wired by default
  readonly project?: Files;
  // the release's files, by their path from the release folder; RELEASE by default
  readonly release?: Files;
  readonly tracked?: readonly string[];
  // the repository first, its packages after it
  readonly units?: readonly UnitFixture[];
  // the project's files that cannot be read, by their path from its folder
  readonly unreadable?: readonly string[];
}

const RULE = 'configuration-takes-every-part-of-its-blocks';

const below = (input: { files: Files; folder: string }): Files =>
  Object.fromEntries(
    Object.entries(input.files).map(([path, text]) => [
      `${input.folder}/${path}`,
      text,
    ]),
  );

const unitOf = (input: { blocks: readonly BlockOf[]; unit: UnitFixture }): ProjectUnit =>
  ProjectUnit.create({
    axes: input.unit.axes ?? [
      Axis.Foundation,
      Axis.Architecture,
      Axis.Workflow,
    ],
    blocks: new Set(
      (input.unit.blocks ?? input.blocks.map((block) => block.id)).map(BlockId.create),
    ),
    languages: new Set(),
    loweredRules: new Set((input.unit.lowered ?? []).map(RuleSlug.create)),
    packs: [],
    path: UnitPath.create(input.unit.path ?? ''),
  });

const resolutionOf = (input: {
  blocks: readonly BlockOf[];
  units: readonly UnitFixture[];
}): Resolution =>
  Resolution.create({
    active: [],
    blocks: input.blocks.map((block) => ({
      id: BlockId.create(block.id),
      layer: block.layer,
    })),
    check: '',
    listing: BlockListing.create({
      overrides: [],
      repository: [],
      units: [],
    }),
    model: BlockModel.create({
      blocks: [],
      roles: [],
      rules: [],
    }),
    musts: [],
    units: input.units.map((unit) =>
      unitOf({
        blocks: input.blocks,
        unit,
      }),
    ),
    warnings: [],
  });

const wiringOf = (
  fixture: WiringFixture = {},
): WiringInput & {
  parser: ConfigurationParser;
} => ({
  releaseFolder: releaseFolderPath,
  files: createFakeProjectFiles({
    files: {
      ...below({
        files: fixture.release ?? RELEASE,
        folder: releaseFolderPath,
      }),
      ...below({
        files: fixture.project ?? wired,
        folder: PROJECT,
      }),
    },
    links: Object.fromEntries(
      Object.entries(fixture.links ?? {}).map(([link, folder]) => [
        `${PROJECT}/${link}`,
        `${PROJECT}${folder === '' ? '' : `/${folder}`}`,
      ]),
    ),
    unreadable: (fixture.unreadable ?? []).map((path) => `${PROJECT}/${path}`),
  }),
  packs: (fixture.packs ?? []).map(PackPath.create),
  parser: createConfigurationParser(),
  project: PROJECT,
  resolution: resolutionOf({
    blocks: fixture.blocks ?? BLOCKS,
    units: fixture.units ?? [
      {},
    ],
  }),
  workingTree: createFakeWorkingTree({
    tracked: fixture.tracked ?? [],
  }),
});

// The ports the plan reads a wiring through: its project opened by its source.
const planInputOf = (
  wiring: WiringInput,
): PresetsPorts & {
  start: string;
} => ({
  files: wiring.files,
  source: createFakeProjectSource({
    declaration: {
      packs: wiring.packs,
      resolution: wiring.resolution,
      status: ConfigReadStatus.Parsed,
    },
    place: {
      releaseFolder: wiring.releaseFolder,
      project: wiring.project,
    },
  }),
  start: wiring.project,
  workingTree: wiring.workingTree,
});

const REACT_DOM = 'typescript/biome/foundation/react-dom.jsonc';

// A pack the project keeps in packs/acme: a part of Biome for its block acme, and acme as a tool
// of its own, whose template takes its part.
const ACME_SELF = 'packs/acme/presets/common/acme/foundation/self.toml';

const PACK_FILES: Files = {
  [ACME_SELF]: 'strict = true\n',
  'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
  'packs/acme/templates/project/common/acme/acme.toml': 'extends = "<parts>"\n',
} as const;

// The pack's files in a folder of packs: its part of Biome, its tool's part and its template.
const packFilesIn = (folder: string): Files =>
  Object.fromEntries(
    Object.entries(PACK_FILES).map(([path, text]) => [
      `${folder}/${path.slice('packs/'.length)}`,
      text,
    ]),
  );

// lefthook, whose lefthook.yaml takes a part for each tool whose hook it runs; its mise.toml takes
// none.
const HOOKS_RELEASE: Files = {
  'templates/project/common/lefthook/lefthook.yaml': 'extends:\n  - <parts>\n',
  'templates/project/common/lefthook/mise.toml': '[tools]\nlefthook = "2.2.2"\n',
  'presets/common/lefthook/workflow/biome.yaml': 'pre-commit: {}\n',
  'presets/common/lefthook/workflow/ruff.yaml': 'pre-commit: {}\n',
} as const;

const hooksBlocks = [
  ...BLOCKS,
  implementationOf('lefthook'),
  implementationOf('react-dom'),
];

const hooksOf = (names: readonly string[]): string =>
  `extends:\n${names.map((name) => `  - ${part(`common/lefthook/workflow/${name}.yaml`)}\n`).join('')}`;

// The repository runs Biome and the hooks; its member packages/check runs Ruff and does not follow
// the hooks.
const hooksRootBlocks = [
  'core',
  'typescript',
  'biome',
  'lefthook',
];

const hooksMember = {
  blocks: [
    'core',
    'python',
    'ruff',
  ],
  path: 'packages/check',
};

const hooksUnits = [
  {
    blocks: hooksRootBlocks,
  },
  hooksMember,
];

// packages/check follows the hooks itself; apps/web runs Ruff and does not follow them.
const hooksOwnUnits = [
  {
    blocks: hooksRootBlocks,
  },
  {
    ...hooksMember,
    blocks: [
      ...hooksMember.blocks,
      'lefthook',
    ],
  },
  {
    ...hooksMember,
    path: 'apps/web',
  },
];

// The warnings of the wiring, each built from the values it names, a unit by its path.

interface ToolWiredNowhereFixture {
  readonly tool: string;
  readonly unit: string;
}

const toolWiredNowhere = (details: ToolWiredNowhereFixture): ProjectWarning => ({
  details: {
    tool: details.tool,
    unit: UnitPath.create(details.unit),
  },
  kind: WarningKind.ToolWiredNowhere,
});

const folderKeepsConfig = (
  details: WarningDetails[WarningKind.FolderKeepsConfig],
): ProjectWarning => ({
  details,
  kind: WarningKind.FolderKeepsConfig,
});

const fileMiswired = (details: WarningDetails[WarningKind.FileMiswired]): ProjectWarning => ({
  details,
  kind: WarningKind.FileMiswired,
});

const wiringFileUnreadable = (file: string): ProjectWarning => ({
  details: {
    file,
  },
  kind: WarningKind.WiringFileUnreadable,
});

const skipOfNoMember = (details: WarningDetails[WarningKind.SkipOfNoMember]): ProjectWarning => ({
  details,
  kind: WarningKind.SkipOfNoMember,
});

const memberNotSkipped = (
  details: WarningDetails[WarningKind.MemberNotSkipped],
): ProjectWarning => ({
  details,
  kind: WarningKind.MemberNotSkipped,
});

interface ReleaseLinkLoopsFixture {
  readonly unit: string;
}

const releaseLinkLoops = (details: ReleaseLinkLoopsFixture): ProjectWarning => ({
  details: {
    unit: UnitPath.create(details.unit),
  },
  kind: WarningKind.ReleaseLinkLoops,
});

export type { Files, WiringFixture };
export {
  ACME_SELF,
  BIOME_PARTS,
  BLOCKS,
  biomeJson,
  fileMiswired,
  folderKeepsConfig,
  HOOKS_RELEASE,
  hooksBlocks,
  hooksMember,
  hooksOf,
  hooksOwnUnits,
  hooksRootBlocks,
  hooksUnits,
  implementationOf,
  importLinter,
  importLinterCopy,
  memberNotSkipped,
  PACK_FILES,
  packageCruiser,
  packFilesIn,
  part,
  planInputOf,
  pyproject,
  REACT_DOM,
  RELEASE,
  RULE,
  releaseLinkLoops,
  rootCruiser,
  ruffConfig,
  ruffSection,
  skipOfNoMember,
  template,
  toolWiredNowhere,
  UNBIOMED,
  vultureCopy,
  vulturePart,
  vultureSection,
  wired,
  wiringFileUnreadable,
  wiringOf,
};
