import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { Files } from './constitution.fixtures';
import { contextOf, HookEvent, runHook } from './hook.fixtures';
import { archiveOf, createRealPluginRoot, LINK, linkArchive } from './plugin-root.fixtures';
import { ConfigKey, configOf, createProject } from './project.fixtures';

// A release's presets and templates as far as a case reads them: Biome's
// parts, which a file takes by their paths; dependency-cruiser's, which a
// workspace's root takes only partly; Ruff's chain, which a file names by a
// marker; vulture's and import-linter's parts, which a file copies under a
// marker; and the parts the repository's root takes over every unit's blocks:
// OSV-Scanner's and hadolint's, in the script lines of mise.toml.
const RELEASE: Files = {
  'presets/common/biome/foundation/self.jsonc': '{}\n',
  'presets/typescript/biome/foundation/bindings.yaml': 'core: {}\n',
  'presets/typescript/biome/foundation/core.jsonc': '{}\n',
  'presets/typescript/biome/foundation/plugins/react-compiler-on.grit': 'language js\n',
  'presets/typescript/biome/foundation/react-dom.jsonc': '{}\n',
  'presets/typescript/biome/foundation/self.jsonc': '{}\n',
  'presets/typescript/biome/foundation/typescript.jsonc': '{}\n',
  'presets/typescript/dependency-cruiser/architecture/core.mjs': 'export default {};\n',
  'presets/typescript/dependency-cruiser/architecture/workspace.mjs': 'export default {};\n',
  'presets/typescript/dependency-cruiser/foundation/self.mjs': 'export default {};\n',
  'presets/python/ruff/foundation/core.toml': 'extend = "self.toml"\n',
  'presets/python/ruff/foundation/self.toml': 'line-length = 100\n',
  'presets/python/ruff/foundation/pytest.toml': 'extend = "core.toml"\n',
  'presets/python/ruff/foundation/fastapi.toml': 'extend = "pytest.toml"\n',
  'presets/python/vulture/foundation/core.toml':
    '[tool.vulture]\npaths = ["src"]\n\nmin_confidence = 60\n',
  'presets/python/import-linter/foundation/core.toml':
    '[[tool.importlinter.contracts]]\nname = "module-imports-form-no-cycle"\nancestors = ["<package>"]\n',
  'presets/common/osv-scanner/foundation/core.txt': 'MIT\n',
  'presets/dockerfile/hadolint/foundation/dockerfile.yaml': 'failure-threshold: style\n',
  'templates/project/common/biome/biome.json': '{ "extends": ["<parts>"] }\n',
  'templates/project/typescript/biome/biome.json': '{ "extends": ["<parts>"] }\n',
  'templates/project/typescript/dependency-cruiser/.dependency-cruiser.mjs':
    "export default { extends: ['<parts>'] };\n",
  'templates/project/python/ruff/pyproject.toml':
    '# from <parts>\n[tool.ruff]\nextend = "<chain end>"\n',
  'templates/project/python/vulture/pyproject.toml':
    '# from <parts>\n<copied parts>\n# end <parts>\n',
  'templates/project/python/import-linter/pyproject.toml':
    '# from <parts>\n<copied parts>\n# end <parts>\n',
  'templates/project/python/python/pyproject.toml': '[project]\nname = "<name>"\n',
  'templates/project/typescript/typescript/.gitignore': 'node_modules/\n',
  'templates/project/common/osv-scanner/mise.toml':
    '[tasks."audit:check"]\nrun = "osv-scanner --licenses=<parts>"\n',
  'templates/project/dockerfile/hadolint/mise.toml':
    '[tasks."dockerfile:check"]\nrun = "hadolint --config <parts> Dockerfile"\n',
};

const PRESETS = `${LINK}/presets`;
const part = (path: string): string => `${PRESETS}/${path}`;

const BIOME_PARTS: readonly string[] = [
  'common/biome/foundation/self.jsonc',
  'typescript/biome/foundation/self.jsonc',
  'typescript/biome/foundation/core.jsonc',
  'typescript/biome/foundation/typescript.jsonc',
].map(part);

const biomeJson = (parts: readonly string[]): string =>
  `${JSON.stringify(
    {
      extends: parts,
    },
    undefined,
    2,
  )}\n`;

const ruffMarker = (): string =>
  `# from ${part('python/ruff/foundation/self.toml')}, ${part('python/ruff/foundation/core.toml')}\n[tool.ruff]\nextend = "${part('python/ruff/foundation/core.toml')}"\n`;

// vulture's part copied under its marker, with a setting of the project's own after it.
const vultureCopy = (confidence: number): string =>
  `# from ${part('python/vulture/foundation/core.toml')}\n[tool.vulture]\npaths = ["src"]\nmin_confidence = ${String(confidence)}\n# end ${part('python/vulture/foundation/core.toml')}\nignore_names = ["main"]\n`;

const importLinterCopy = (): string =>
  `# from ${part('python/import-linter/foundation/core.toml')}\n[[tool.importlinter.contracts]]\nname = "module-imports-form-no-cycle"\nancestors = ["shop"]\n# end ${part('python/import-linter/foundation/core.toml')}\n`;

const write = (input: { files: Files; folder: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folder, path)), {
      recursive: true,
    });
    writeFileSync(join(input.folder, path), text);
  }
};

const createWiredPluginRoot = (): string => {
  const root = createRealPluginRoot();

  write({
    files: RELEASE,
    folder: archiveOf(root),
  });

  return root;
};

interface WiredProject {
  bare?: boolean;
  config?: string;
  // files written untracked, over the wired base unless bare
  files?: Files;
  omit?: readonly string[];
  tracked?: Files;
}

const LANGUAGES = '[typescript, python]';
const IMPLEMENTATIONS = 'biome, dependency-cruiser, ruff, vulture, import-linter, osv-scanner';

const wiredConfig = (
  config: Partial<Record<ConfigKey, string>> = {},
  implementations: readonly string[] = [],
): string =>
  configOf({
    [ConfigKey.Domains]: '[workspace]',
    [ConfigKey.Languages]: LANGUAGES,
    [ConfigKey.Implementations]: `[${[
      IMPLEMENTATIONS,
      ...implementations,
    ].join(', ')}]`,
    ...config,
  });

// A file for every tool the base configuration makes active, each taking its parts.
const cruiserConfig = (parts: readonly string[]): string =>
  `export default { extends: [${parts.map((path) => `'${part(path)}'`).join(', ')}] };\n`;
const ROOT_CRUISER = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);
const OSV_TASK = `[tasks."audit:check"]\nrun = "osv-scanner --licenses=${part('common/osv-scanner/foundation/core.txt')}"\n`;
const WIRED: Files = {
  '.dependency-cruiser.mjs': ROOT_CRUISER,
  'biome.json': biomeJson(BIOME_PARTS),
  'mise.toml': OSV_TASK,
  'pyproject.toml': `${ruffMarker()}\n${vultureCopy(60)}\n${importLinterCopy()}`,
};

const createWiredProject = (input: WiredProject): string => {
  const project = createProject({
    config: input.config ?? wiredConfig(),
    files: Object.fromEntries(
      Object.entries({
        ...(input.bare === true ? {} : WIRED),
        ...input.files,
        ...input.tracked,
      }).filter(([path]) => !(input.omit ?? []).includes(path)),
    ),
  });

  if (input.tracked !== undefined) {
    execFileSync(
      'git',
      [
        'add',
        '--',
        ...Object.keys(input.tracked),
      ],
      {
        cwd: project,
      },
    );
  }

  return project;
};

// A pack the project keeps in packs/acme: its block acme, a part of Biome for
// it, and acme as a tool of its own, whose template takes its part.
const PACK = 'packs/acme';
const PACK_FILES: Files = {
  [`${PACK}/blocks/implementations/acme/acme.md`]: [
    '---',
    'id: acme',
    'summary: "Acme checks the shop."',
    'requires: []',
    'extends: null',
    'abstract: false',
    'languages: []',
    'dictionary: []',
    'governs: []',
    '---',
    '',
    '# Acme',
    '',
    '> Acme checks the shop.',
    '',
  ].join('\n'),
  [`${PACK}/presets/typescript/biome/foundation/acme.jsonc`]: '{}\n',
  [`${PACK}/presets/common/acme/foundation/self.toml`]: 'strict = true\n',
  [`${PACK}/templates/project/common/acme/acme.toml`]: 'extends = "<parts>"\n',
};

const packConfig = (): string =>
  wiredConfig({
    [ConfigKey.Implementations]:
      '[biome, dependency-cruiser, ruff, vulture, import-linter, osv-scanner, acme]',
    [ConfigKey.Packs]: `[${PACK}]`,
  });

const digestOf = (input: { project: string; root: string }): string =>
  contextOf(
    runHook({
      event: HookEvent.Startup,
      project: input.project,
      root: input.root,
    }),
  );

const WIRING = '- wiring: ';
const wiringOf = (context: string): readonly string[] =>
  context
    .split('\n')
    .filter((line) => line.startsWith(WIRING))
    .map((line) => line.slice(WIRING.length));

const wiringListOf = (input: { project: string; root: string }): readonly string[] => {
  linkArchive({
    archive: archiveOf(input.root),
    project: input.project,
  });

  return spawnSync(
    process.env['HOOK_SHELL'] ?? 'bash',
    [
      join(input.root, 'hooks', 'wiring.sh'),
    ],
    {
      cwd: input.project,
      encoding: 'utf8',
      env: Object.fromEntries([
        ...Object.entries(process.env),
        [
          'CLAUDE_PLUGIN_ROOT',
          input.root,
        ],
        [
          'CLAUDE_PROJECT_DIR',
          input.project,
        ],
      ]),
    },
  )
    .stdout.split('\n')
    .map((line) => line.trim());
};

export {
  BIOME_PARTS,
  biomeJson,
  createWiredPluginRoot,
  createWiredProject,
  cruiserConfig,
  digestOf,
  importLinterCopy,
  OSV_TASK,
  PACK,
  PACK_FILES,
  packConfig,
  part,
  ROOT_CRUISER,
  ruffMarker,
  vultureCopy,
  wiredConfig,
  wiringListOf,
  wiringOf,
};
