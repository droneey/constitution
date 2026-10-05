import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { Files } from './constitution.fixtures';
import { INSTALLED, removeFolder } from './plugin-root.fixtures';

enum ConfigKey {
  Version = 'version',
  Axes = 'axes',
  Domains = 'domains',
  Platforms = 'platforms',
  Languages = 'languages',
  Implementations = 'implementations',
  Apps = 'apps',
  Check = 'check',
  Overrides = 'overrides',
}

enum Repository {
  Folder = 'folder',
  Worktree = 'worktree',
  None = 'none',
}

type Config = Partial<Record<ConfigKey, string>> & {
  omit?: ConfigKey;
};

// Paths are relative to the project root; aboveConfig and links lie in the
// folder above it.
interface ProjectLayout {
  aboveConfig?: string;
  config?: string;
  files?: Files;
  links?: Readonly<Record<string, string>>;
  namedPipes?: readonly string[];
  // a worktree's root holds .git as a file
  repository?: Repository;
  unreadable?: readonly string[];
}

const CONFIG = 'constitution.yaml';

const DEFAULTS: Readonly<Record<ConfigKey, string>> = {
  apps: '{}',
  axes: '[foundation, architecture, workflow]',
  check: 'bun run check',
  domains: '[]',
  implementations: '[]',
  languages: '[]',
  overrides: '[]',
  platforms: '[]',
  version: '1.0.0',
};

const created: string[] = [];

// A value that opens with a line break is a block below its key.
const configOf = (config: Config): string =>
  Object.values(ConfigKey)
    .filter((key) => key !== config.omit)
    .map((key) => {
      const setting = config[key] ?? DEFAULTS[key];

      return setting.startsWith('\n') ? `${key}:${setting}` : `${key}: ${setting}`;
    })
    .join('\n')
    .concat('\n');

const write = (input: { path: string; text: string }): void => {
  mkdirSync(dirname(input.path), {
    recursive: true,
  });
  writeFileSync(input.path, input.text);
};

const NO_ACCESS = 0o000;

const initRepository = (input: { repository: ProjectLayout['repository']; root: string }): void => {
  if (input.repository === Repository.Worktree) {
    write({
      path: join(input.root, '.git'),
      text: 'gitdir: /elsewhere/.git/worktrees/project\n',
    });
  }

  if ((input.repository ?? Repository.Folder) === Repository.Folder) {
    execFileSync(
      'git',
      [
        'init',
        '--quiet',
      ],
      {
        cwd: input.root,
      },
    );
  }
};

const writeLayout = (input: { layout: ProjectLayout; root: string }): void => {
  const { layout, root } = input;

  for (const [path, text] of Object.entries({
    ...(layout.config === undefined
      ? {}
      : {
          [CONFIG]: layout.config,
        }),
    ...(layout.aboveConfig === undefined
      ? {}
      : {
          [join('..', CONFIG)]: layout.aboveConfig,
        }),
    ...layout.files,
  })) {
    write({
      path: join(root, path),
      text,
    });
  }
};

const writeSpecials = (input: { above: string; layout: ProjectLayout; root: string }): void => {
  const { above, layout, root } = input;

  for (const pipe of layout.namedPipes ?? []) {
    execFileSync('mkfifo', [
      join(root, pipe),
    ]);
  }

  for (const [link, target] of Object.entries(layout.links ?? {})) {
    symlinkSync(join(root, target), join(above, link));
  }

  for (const path of layout.unreadable ?? []) {
    chmodSync(join(root, path), NO_ACCESS);
  }
};

// The project root sits one folder below a temporary folder, so a
// constitution.yaml can lie above the repository.
const createProject = (layout: ProjectLayout): string => {
  const above = mkdtempSync(join(tmpdir(), 'constitution-project-'));
  const root = join(above, 'project');

  created.push(above);
  mkdirSync(root);
  initRepository({
    repository: layout.repository,
    root,
  });
  writeLayout({
    layout,
    root,
  });
  writeSpecials({
    above,
    layout,
    root,
  });

  return realpathSync(root);
};

const removeProjects = (): void => {
  for (const folder of created.splice(0)) {
    removeFolder(folder);
  }
};

const localBlock = (fields: Readonly<Record<string, string>>): string =>
  [
    '---',
    ...Object.entries(fields).map(([key, field]) => `${key}: ${field}`),
    '---',
    '',
    '# A local block',
    '',
  ].join('\n');

const IMPLEMENTATIONS = 'implementations';

const rulesFolder = (folder: string): string => (folder === '' ? 'rules' : `rules/${folder}`);

const localBlockFiles = (input: {
  fields?: Readonly<Record<string, string>>;
  folder?: string;
  id: string;
  omit?: string;
}): Files => ({
  [`${rulesFolder(input.folder ?? IMPLEMENTATIONS)}/${input.id}.md`]: localBlock(
    Object.fromEntries(
      Object.entries({
        id: input.id,
        summary: `The local ${input.id} block.`,
        requires: '[]',
        extends: 'null',
        abstract: 'false',
        checks: '[]',
        languages: '[]',
        roles: '[]',
        dictionary: '[]',
        governs: '[]',
        ...input.fields,
      }).filter(([key]) => key !== input.omit),
    ),
  ),
});

const localPath = (id: string, folder: string = IMPLEMENTATIONS): string =>
  `./${rulesFolder(folder)}/${id}.md`;

const PARAGLIDE = localPath('paraglide');

const paraglideFiles = (input: { omit?: string; requires?: string }): Files =>
  localBlockFiles({
    fields: {
      requires: input.requires ?? '[i18n, typescript]',
      summary: 'Paraglide messages, compiled per locale.',
      dictionary: '[Paraglide]',
    },
    id: 'paraglide',
    ...(input.omit === undefined
      ? {}
      : {
          omit: input.omit,
        }),
  });

// Modelled on the reference web application.
const BROWSER_APP: ProjectLayout = {
  config: [
    'version: 1.0.0                    # the constitution release the project follows',
    'axes: [foundation, architecture, workflow]',
    'domains: [ui, remote-data, i18n, analytics, version-control,',
    '          untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    'implementations: [react-dom, tanstack-query, matomo, biome, git, lefthook,',
    `                  betterleaks, ${PARAGLIDE}]`,
    'apps: {}',
    'check: bun run check',
    'overrides:',
    '  - rule: analytics-consent-first',
    '    level: SHOULD',
    '    reason: "Matomo runs without cookies until the consent banner ships"',
    '    until: 2999-12-31',
    '',
  ].join('\n'),
  files: paraglideFiles({}),
};

// Modelled on nydra, with block sequences.
const CLI: ProjectLayout = {
  config: [
    'version: 1.0.0',
    'axes: [foundation, architecture, workflow]',
    'domains:',
    '  - version-control',
    '  - untrusted-client',
    'platforms:',
    '- cli',
    'languages: [typescript]',
    'implementations: [bun, biome, git, betterleaks]',
    'apps: {}',
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
};

// Modelled on devkit: packages as applications, one with its own override.
const LIBRARY: ProjectLayout = {
  config: [
    'version: 1.0.0',
    'axes: [foundation, architecture, workflow]',
    'domains: [version-control]',
    'platforms: []',
    'languages: [typescript]',
    'implementations: [biome, git, lefthook, betterleaks]',
    'apps:',
    '  packages/react-kit:',
    '    domains: [ui, untrusted-client, unreliable-network]',
    '    platforms: [browser]',
    '    implementations: [react-dom]',
    '    overrides:',
    '      - rule: four-data-states',
    '        level: MAY',
    '        reason: "The kit renders the states its caller passes"',
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
};

const HTML_SITE: ProjectLayout = {
  config: configOf({
    check: 'npx html-validate .',
    domains: '[ui, untrusted-client, unreliable-network, version-control]',
    implementations: '[git]',
    platforms: '[browser]',
  }),
};

// Local blocks of every kind of front matter: CRLF line ends, a quoted
// summary, block lists, a constitution host, an abstract constitution base and
// one block in an application.
const LOCAL_PROJECT: ProjectLayout = {
  config: [
    'version: 1.0.0',
    'axes: [foundation, architecture, workflow]',
    'domains: [version-control, ui, untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    `implementations: [react-dom, betterleaks, git, ${localPath('git-flow')}, ${localPath('lint-kit')}]`,
    'apps:',
    '  packages/web:',
    '    domains: [i18n]',
    `    implementations: [${PARAGLIDE}, ${localPath('lint-kit')}]`,
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
  files: {
    ...paraglideFiles({}),
    'rules/implementations/git-flow.md': [
      '---',
      'id: git-flow',
      'summary: "Git flow: a branch per change, a tag per release."',
      'requires:',
      '  - version-control',
      '  - git',
      'extends: null',
      'abstract: false',
      'checks: []',
      'languages: []',
      'roles: []',
      'dictionary: []',
      'governs: []',
      '---',
      '',
    ].join('\r\n'),
    'rules/implementations/lint-kit.md': [
      '---',
      'id: lint-kit',
      "summary: 'Lints TypeScript the way this team likes.'",
      'requires:',
      '  - typescript',
      'extends: _lint-base',
      'abstract: false',
      'checks: [lint]',
      'languages:',
      '  - typescript',
      'roles: []',
      'dictionary: []',
      'governs: []',
      '---',
      '',
    ].join('\n'),
  },
};

const TEMPLATES = join(import.meta.dir, '..', '..', 'templates');

const fromTemplate = (input: {
  fills: ReadonlyArray<
    readonly [
      string,
      string,
    ]
  >;
  name: string;
}): string =>
  input.fills.reduce(
    (text, [placeholder, filling]) => text.replace(placeholder, filling),
    readFileSync(join(TEMPLATES, input.name), 'utf8'),
  );

// The files /ratify writes from the templates; the hook reads only a local
// block's front matter, so only its placeholders are filled.
const RATIFIED: ProjectLayout = {
  config: fromTemplate({
    fills: [
      [
        '<installed version>',
        INSTALLED,
      ],
      [
        'domains: []',
        'domains: [i18n, version-control]',
      ],
      [
        'languages: []',
        'languages: [typescript]',
      ],
      [
        'implementations: []',
        `implementations: [git, betterleaks, ${PARAGLIDE}]`,
      ],
      [
        '<check command>',
        'bun run check',
      ],
    ],
    name: 'constitution.yaml',
  }),
  files: {
    'rules/implementations/paraglide.md': fromTemplate({
      fills: [
        [
          '<id>',
          'paraglide',
        ],
        [
          '<One sentence of at most 70 characters.>',
          'Paraglide messages, compiled per locale.',
        ],
        [
          'requires: []',
          'requires: [i18n, typescript]',
        ],
      ],
      name: 'block.md',
    }),
  },
};

// The reference web application and command-line tool, as the real blocks of
// this repository would serve them.
const REAL_WEB_APP: ProjectLayout = {
  config: [
    'version: 1.0.0',
    'axes: [foundation, architecture, workflow]',
    '',
    'domains: [ui, a11y, remote-data, i18n, analytics, version-control,',
    '          untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript, css]',
    'implementations: [react-dom, tanstack-router, tanstack-start, tanstack-query, tanstack-form,',
    '                  tailwind, shadcn, storybook, ky, zod, vite, bun-test, testing-library,',
    '                  matomo, lingui, bun, tsc, biome, dependency-cruiser, ls-lint, knip,',
    '                  syncpack, stryker, git, lefthook, betterleaks, osv-scanner, renovate, mise]',
    'apps: {}',
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
};

const REAL_CLI: ProjectLayout = {
  config: [
    'version: 1.0.0',
    'axes: [foundation, architecture, workflow]',
    '',
    'domains: [convergence, remote-data, version-control]',
    'platforms: [cli]',
    'languages: [typescript]',
    'implementations: [bun, bun-test, bunli, zod, yaml, yamllint, tsc, biome, dependency-cruiser,',
    '                  ls-lint, knip, syncpack, stryker, mise, git, lefthook, betterleaks,',
    '                  osv-scanner, renovate]',
    'apps: {}',
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
};

export type { ProjectLayout };
export {
  BROWSER_APP,
  CLI,
  ConfigKey,
  configOf,
  createProject,
  HTML_SITE,
  LIBRARY,
  LOCAL_PROJECT,
  localBlockFiles,
  localPath,
  PARAGLIDE,
  paraglideFiles,
  RATIFIED,
  REAL_CLI,
  REAL_WEB_APP,
  Repository,
  removeProjects,
};
