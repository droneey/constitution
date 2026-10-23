import { Axis, Layer } from '#/kernel/constants';

import { ARCHIVE, PROJECT } from '../../../../../__tests__/project.fixtures';
import { createFakeProjectFiles } from '../../../../../__tests__/project-files.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { ConfigItem, ProjectUnit, ProjectWarning, Resolution } from '../../../../entities';
import type { WiringInput } from '../check-wiring.use-case';

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
];

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
};

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
];

const cruiserConfig = (paths: readonly string[]): string =>
  `export default { extends: [${paths.map((path) => `'${part(path)}'`).join(', ')}] };\n`;

const ROOT_CRUISER = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);

const PACKAGE_CRUISER = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/core.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);

const ruffConfig = (links: readonly string[], end: string): string =>
  `# from ${links.map((link) => part(`python/ruff/foundation/${link}.toml`)).join(', ')}\n[tool.ruff]\nextend = "${part(`python/ruff/foundation/${end}.toml`)}"\n`;

const VULTURE = part('python/vulture/foundation/core.toml');
const IMPORT_LINTER = part('python/import-linter/foundation/core.toml');

// vulture's part copied under its marker, with a setting of the project's own after it.
const vultureCopy = (lines: string): string =>
  `# from ${VULTURE}\n${lines}# end ${VULTURE}\nignore_names = ["main"]\n`;

const VULTURE_COPY = vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 60\n');

const IMPORT_LINTER_COPY = `# from ${IMPORT_LINTER}\n[[tool.importlinter.contracts]]\nname = "no-cycle"\nancestors = ["shop"]\n# end ${IMPORT_LINTER}\n`;

const OSV_TASK = `[tasks."audit:check"]\nrun = "osv-scanner --licenses=${part('common/osv-scanner/foundation/core.txt')}"\n`;

const RUFF = ruffConfig(
  [
    'self',
    'core',
  ],
  'core',
);

const PYPROJECT = `${RUFF}\n${VULTURE_COPY}\n${IMPORT_LINTER_COPY}`;

// A file for every tool the repository's blocks make active but Biome, each taking its parts.
const UNBIOMED: Files = {
  '.dependency-cruiser.mjs': ROOT_CRUISER,
  'mise.toml': OSV_TASK,
  'pyproject.toml': PYPROJECT,
};

// A file for every tool the repository's blocks make active, each taking its parts.
const WIRED: Files = {
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
  readonly items?: readonly ConfigItem[];
  // the project's files, by their path from its folder; WIRED by default
  readonly project?: Files;
  // the release's files, by their path from the archive; RELEASE by default
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

const unitOf = (input: {
  blocks: readonly BlockOf[];
  scope: number;
  unit: UnitFixture;
}): ProjectUnit => ({
  axes: input.unit.axes ?? [
    Axis.Foundation,
    Axis.Architecture,
    Axis.Workflow,
  ],
  blocks: new Set(input.unit.blocks ?? input.blocks.map((block) => block.id)),
  lowered: new Set(input.unit.lowered ?? []),
  path: input.unit.path ?? '',
  scope: input.scope,
});

const resolutionOf = (input: {
  blocks: readonly BlockOf[];
  units: readonly UnitFixture[];
}): Resolution => ({
  active: [],
  blocks: input.blocks,
  check: '',
  count: input.blocks.length,
  index: [],
  musts: [],
  units: input.units.map((unit, scope) =>
    unitOf({
      blocks: input.blocks,
      scope,
      unit,
    }),
  ),
  warnings: [],
});

const packOf = (path: string): ConfigItem => ({
  app: '',
  key: 'packs',
  text: path,
});

const wiringOf = (fixture: WiringFixture = {}): WiringInput => ({
  archive: ARCHIVE,
  config: {
    apps: [],
    empties: [],
    items: fixture.items ?? [],
    keys: [],
    lists: [],
    overrides: [],
  },
  files: createFakeProjectFiles({
    files: {
      ...below({
        files: fixture.release ?? RELEASE,
        folder: ARCHIVE,
      }),
      ...below({
        files: fixture.project ?? WIRED,
        folder: PROJECT,
      }),
    },
    unreadable: (fixture.unreadable ?? []).map((path) => `${PROJECT}/${path}`),
  }),
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

// What a warning or a line means: the names it gives, in their order, each a path, a file, a
// part, a block, a count or a word that tells one list from another.
const GAP = /[^\w./:<>-]+/u;
const IDS: readonly string[] = [
  ...BLOCKS.map((block) => block.id),
  'acme',
  'django',
  'fastapi',
  'github',
  'hadolint',
  'knip',
  'pytest',
  'react-dom',
];
const WORDS: readonly string[] = [
  'adds',
  'lacks',
  'lower',
  'names',
  'new',
];

const isName = (token: string): boolean =>
  (/[./]/u.test(token) && !token.startsWith('/')) ||
  /^\d+$/u.test(token) ||
  IDS.includes(token) ||
  WORDS.includes(token);

const mentionsOf = (text: string): readonly string[] => text.split(GAP).filter(isName);

const warnedOf = (warnings: readonly ProjectWarning[]): readonly (readonly string[])[] =>
  warnings.map((warning) => [
    warning.code,
    ...mentionsOf(warning.message),
  ]);

const plannedOf = (lines: readonly string[]): readonly (readonly string[])[] =>
  lines.map(mentionsOf);

export type { Files, WiringFixture };
export {
  BIOME_PARTS,
  BLOCKS,
  biomeJson,
  IMPORT_LINTER,
  IMPORT_LINTER_COPY,
  implementationOf,
  PACKAGE_CRUISER,
  PYPROJECT,
  packOf,
  part,
  plannedOf,
  RELEASE,
  ROOT_CRUISER,
  RUFF,
  RULE,
  ruffConfig,
  template,
  UNBIOMED,
  VULTURE,
  VULTURE_COPY,
  vultureCopy,
  WIRED,
  warnedOf,
  wiringOf,
};
