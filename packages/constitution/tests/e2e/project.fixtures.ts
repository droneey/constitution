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
import { toolEnvironment } from './package.fixtures';
import { removeFolder } from './plugin-root.fixtures';

enum ConfigKey {
  Axes = 'axes',
  Domains = 'domains',
  Platforms = 'platforms',
  Languages = 'languages',
  Implementations = 'implementations',
  Packs = 'packs',
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
  files?: Files | undefined;
  links?: Readonly<Record<string, string>>;
  namedPipes?: readonly string[];
  // a worktree's root holds .git as a file
  repository?: Repository;
  unreadable?: readonly string[];
}

const CONFIG = 'constitution.yaml';

const DEFAULTS: Readonly<Record<ConfigKey, string>> = {
  axes: '[architecture, workflow]',
  domains: '[]',
  implementations: '[]',
  languages: '[]',
  overrides: '[]',
  packs: '[]',
  platforms: '[]',
} as const;

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

// A workspace of the members given, each by its path with its constitution.yaml: the root's
// package.json declares them, and each holds a package.json of its own.
const workspaceOf = (members: Readonly<Record<string, string>>): Files => ({
  'package.json': `${JSON.stringify({
    workspaces: Object.keys(members),
  })}\n`,
  ...Object.fromEntries(
    Object.entries(members).flatMap(([path, config]) => [
      [
        `${path}/package.json`,
        '{}\n',
      ],
      [
        `${path}/${CONFIG}`,
        config,
      ],
    ]),
  ),
});

interface LineNumberInput {
  readonly at: string;
  readonly config: string;
}

const lineNumberOf = (input: LineNumberInput): number =>
  input.config.slice(0, input.config.indexOf(input.at)).split('\n').length;

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
        env: toolEnvironment(),
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
    execFileSync(
      'mkfifo',
      [
        join(root, pipe),
      ],
      {
        env: toolEnvironment(),
      },
    );
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

const packCard = (fields: Readonly<Record<string, string>>): string =>
  [
    '---',
    ...Object.entries(fields).map(([key, field]) => `${key}: ${field}`),
    '---',
    '',
    '# A block of the pack',
    '',
  ].join('\n');

// The project's own pack, the folder /ratify writes its blocks to.
const OWN_PACK = 'pack';

// The passport of a block of the pack, by its id.
const packPath = (id: string): string => `${OWN_PACK}/blocks/implementations/${id}/${id}.md`;

interface PackBlockInput {
  readonly fields?: Readonly<Record<string, string>>;
  readonly id: string;
}

const packBlockFiles = (input: PackBlockInput): Files => ({
  [packPath(input.id)]: packCard({
    id: input.id,
    summary: `The pack's ${input.id} block.`,
    requires: '[]',
    extends: 'null',
    abstract: 'false',
    languages: '[]',
    governs: '[]',
    ...input.fields,
  }),
});

const paraglideFiles: Files = packBlockFiles({
  fields: {
    requires: '[i18n, typescript]',
    summary: 'Paraglide messages, compiled per locale.',
  },
  id: 'paraglide',
});

// Modelled on the reference web application.
const browserApp: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    'domains: [ui, remote-data, i18n, analytics, version-control,',
    '          untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    'implementations: [react-dom, tanstack-query, matomo, biome, git, lefthook,',
    '                  betterleaks, paraglide]',
    `packs: [${OWN_PACK}]`,
    'overrides:',
    '  - rule: analytics-consent-first',
    '    level: SHOULD',
    '    reason: "Matomo runs without cookies until the consent banner ships"',
    '    until: 2999-12-31',
    '',
  ].join('\n'),
  files: paraglideFiles,
};

// Modelled on nydra, with block sequences.
const cli: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    'domains:',
    '  - version-control',
    '  - untrusted-client',
    'platforms:',
    '- cli',
    'languages: [typescript]',
    'implementations: [bun, biome, git, betterleaks]',
    'packs: []',
    'overrides: []',
    '',
  ].join('\n'),
};

const templates = join(import.meta.dir, '..', '..', 'templates');

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
    readFileSync(join(templates, input.name), 'utf8'),
  );

// The files /ratify writes from the templates; only the placeholders of the
// block's front matter are filled, and the project lists its own pack.
const ratified: ProjectLayout = {
  config: fromTemplate({
    fills: [
      [
        '<name>',
        'ratified-app',
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
        'implementations: [git, betterleaks, paraglide]',
      ],
      [
        'packs: []',
        `packs: [${OWN_PACK}]`,
      ],
    ],
    name: 'constitution.yaml',
  }),
  files: {
    [packPath('paraglide')]: fromTemplate({
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
      name: 'block/block.md',
    }),
    [packPath('paraglide').replace('/paraglide.md', '/foundation/messages.md')]: fromTemplate({
      fills: [],
      name: 'block/foundation/chapter.md',
    }),
  },
};

// The reference web application and command-line tool, as the real blocks of
// this repository would serve them.
const realWebApp: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    '',
    'domains: [ui, design-system, remote-data, remote-service, i18n, analytics, privacy,',
    '          version-control, untrusted-client]',
    'platforms: [browser, server]',
    'languages: [typescript, css, html, json, toml, yaml]',
    'implementations: [react-dom, tanstack-router, tanstack-start, tanstack-query, tanstack-form,',
    '                  tailwind, shadcn, storybook, ky, zod, vite, bun-test, testing-library,',
    '                  matomo, lingui, bun, tsc, biome, dependency-cruiser, knip,',
    '                  syncpack, stryker, git, lefthook, betterleaks, osv-scanner, renovate, mise]',
    'packs: []',
    'overrides: []',
    '',
  ].join('\n'),
};

const realCli: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    '',
    'domains: [convergence, config-file, remote-data, remote-service, version-control]',
    'platforms: [cli]',
    'languages: [typescript, json, toml, yaml]',
    'implementations: [bun, bun-test, bunli, zod, yaml-js, yamllint, tsc, biome, dependency-cruiser,',
    '                  knip, syncpack, stryker, mise, git, lefthook, betterleaks,',
    '                  osv-scanner, renovate]',
    'packs: []',
    'overrides: []',
    '',
  ].join('\n'),
};

export type { ProjectLayout };
export {
  browserApp,
  ConfigKey,
  cli,
  configOf,
  createProject,
  lineNumberOf,
  OWN_PACK,
  Repository,
  ratified,
  realCli,
  realWebApp,
  removeProjects,
  workspaceOf,
};
