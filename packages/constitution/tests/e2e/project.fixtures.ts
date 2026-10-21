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
import { removeFolder } from './plugin-root.fixtures';

enum ConfigKey {
  Axes = 'axes',
  Domains = 'domains',
  Platforms = 'platforms',
  Languages = 'languages',
  Implementations = 'implementations',
  Packages = 'packages',
  Packs = 'packs',
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
  axes: '[architecture, workflow]',
  check: 'bun run check',
  domains: '[]',
  implementations: '[]',
  languages: '[]',
  overrides: '[]',
  packages: '{}',
  packs: '[]',
  platforms: '[]',
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

const lineNumberOf = (input: { at: string; config: string }): number =>
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

const packCard = (input: {
  fields: Readonly<Record<string, string>>;
  headings: readonly string[];
}): string =>
  [
    '---',
    ...Object.entries(input.fields).map(([key, field]) => `${key}: ${field}`),
    '---',
    '',
    '# A block of the pack',
    '',
    ...input.headings.flatMap((heading) => [
      heading,
      'A rule of the pack.',
      '',
    ]),
  ].join('\n');

// The project's own pack, the folder /ratify writes its blocks to.
const OWN_PACK = 'constitution';
const IMPLEMENTATIONS = 'implementations';

const packPath = (input: { folder?: string; id: string }): string =>
  `${OWN_PACK}/blocks/${input.folder ?? IMPLEMENTATIONS}/${input.id}/${input.id}.md`;

const packBlockFiles = (input: {
  fields?: Readonly<Record<string, string>>;
  folder?: string;
  headings?: readonly string[];
  id: string;
}): Files => ({
  [packPath(input)]: packCard({
    fields: {
      id: input.id,
      summary: `The pack's ${input.id} block.`,
      requires: '[]',
      extends: 'null',
      abstract: 'false',
      languages: '[]',
      dictionary: '[]',
      governs: '[]',
      ...input.fields,
    },
    headings: input.headings ?? [],
  }),
});

const PARAGLIDE_FILES: Files = packBlockFiles({
  fields: {
    requires: '[i18n, typescript]',
    summary: 'Paraglide messages, compiled per locale.',
    dictionary: '[Paraglide]',
  },
  id: 'paraglide',
});

// Modelled on the reference web application.
const BROWSER_APP: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    'domains: [ui, remote-data, i18n, analytics, version-control,',
    '          untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    'implementations: [react-dom, tanstack-query, matomo, biome, git, lefthook,',
    '                  betterleaks, paraglide]',
    'packages: {}',
    `packs: [${OWN_PACK}]`,
    'check: bun run check',
    'overrides:',
    '  - rule: analytics-consent-first',
    '    level: SHOULD',
    '    reason: "Matomo runs without cookies until the consent banner ships"',
    '    until: 2999-12-31',
    '',
  ].join('\n'),
  files: PARAGLIDE_FILES,
};

// Modelled on nydra, with block sequences.
const CLI: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    'domains:',
    '  - version-control',
    '  - untrusted-client',
    'platforms:',
    '- cli',
    'languages: [typescript]',
    'implementations: [bun, biome, git, betterleaks]',
    'packages: {}',
    'packs: []',
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
};

// Modelled on devkit: packages as applications, one with its own override.
const LIBRARY: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    'domains: [version-control]',
    'platforms: []',
    'languages: [typescript]',
    'implementations: [biome, git, lefthook, betterleaks]',
    'packages:',
    '  packages/react-kit:',
    '    domains: [ui, untrusted-client, unreliable-network]',
    '    platforms: [browser]',
    '    implementations: [react-dom]',
    '    overrides:',
    '      - rule: four-data-states',
    '        level: MAY',
    '        reason: "The kit renders the states its caller passes"',
    'packs: []',
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

// A pack of blocks of every kind of front matter: CRLF line ends, a quoted
// summary, block lists, a Constitution host, an abstract Constitution base and
// one block in an application.
const PACK_PROJECT: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    'domains: [version-control, ui, untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    'implementations: [react-dom, betterleaks, git, git-flow, lint-kit]',
    'packages:',
    '  packages/web:',
    '    domains: [i18n]',
    '    implementations: [paraglide, lint-kit]',
    `packs: [${OWN_PACK}]`,
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
  files: {
    ...PARAGLIDE_FILES,
    [packPath({
      id: 'git-flow',
    })]: [
      '---',
      'id: git-flow',
      'summary: "Git flow: a branch per change, a tag per release."',
      'requires:',
      '  - version-control',
      '  - git',
      'extends: null',
      'abstract: false',
      'languages: []',
      'dictionary: []',
      'governs: []',
      '---',
      '',
    ].join('\r\n'),
    [packPath({
      id: 'lint-kit',
    })]: [
      '---',
      'id: lint-kit',
      "summary: 'Lints TypeScript the way this team likes.'",
      'requires:',
      '  - typescript',
      'extends: _lint-base',
      'abstract: false',
      'languages:',
      '  - typescript',
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

// The files /ratify writes from the templates; only the placeholders of the
// block's front matter are filled, and the project lists its own pack.
const RATIFIED: ProjectLayout = {
  config: fromTemplate({
    fills: [
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
      [
        '<check command>',
        'bun run check',
      ],
    ],
    name: 'constitution.yaml',
  }),
  files: {
    [packPath({
      id: 'paraglide',
    })]: fromTemplate({
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
    [packPath({
      id: 'paraglide',
    }).replace('/paraglide.md', '/foundation/messages.md')]: fromTemplate({
      fills: [],
      name: 'block/foundation/chapter.md',
    }),
  },
};

// The reference web application and command-line tool, as the real blocks of
// this repository would serve them.
const REAL_WEB_APP: ProjectLayout = {
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
    'packages: {}',
    'packs: []',
    'check: bun run check',
    'overrides: []',
    '',
  ].join('\n'),
};

const REAL_CLI: ProjectLayout = {
  config: [
    'axes: [architecture, workflow]',
    '',
    'domains: [convergence, config-file, remote-data, remote-service, version-control]',
    'platforms: [cli]',
    'languages: [typescript, json, toml, yaml]',
    'implementations: [bun, bun-test, bunli, zod, yaml-js, yamllint, tsc, biome, dependency-cruiser,',
    '                  knip, syncpack, stryker, mise, git, lefthook, betterleaks,',
    '                  osv-scanner, renovate]',
    'packages: {}',
    'packs: []',
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
  lineNumberOf,
  OWN_PACK,
  PACK_PROJECT,
  packBlockFiles,
  packPath,
  RATIFIED,
  REAL_CLI,
  REAL_WEB_APP,
  Repository,
  removeProjects,
};
