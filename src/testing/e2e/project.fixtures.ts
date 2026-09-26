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
import { syntheticId } from './constitution.fixtures';
import { INSTALLED, removeFolder } from './plugin-root.fixtures';

const CONFIG_KEYS = [
  'version',
  'domains',
  'platforms',
  'languages',
  'implementations',
  'apps',
  'check',
  'overrides',
] as const;

type ConfigKey = (typeof CONFIG_KEYS)[number];

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
  repository?: 'folder' | 'worktree' | 'none';
  unreadable?: readonly string[];
}

const CONFIG = 'constitution.yaml';

const DEFAULTS: Readonly<Record<ConfigKey, string>> = {
  apps: '{}',
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
  CONFIG_KEYS.filter((key) => key !== config.omit)
    .map((key) => {
      const value = config[key] ?? DEFAULTS[key];

      return value.startsWith('\n') ? `${key}:${value}` : `${key}: ${value}`;
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

const initRepository = (input: {
  repository: ProjectLayout['repository'];
  root: string;
}): void => {
  if (input.repository === 'worktree') {
    write({
      path: join(input.root, '.git'),
      text: 'gitdir: /elsewhere/.git/worktrees/project\n',
    });
  }

  if ((input.repository ?? 'folder') === 'folder') {
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

const writeSpecials = (input: {
  above: string;
  layout: ProjectLayout;
  root: string;
}): void => {
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
    ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`),
    '---',
    '',
    '# A local block',
    '',
  ].join('\n');

const localBlockFiles = (input: {
  fields?: Readonly<Record<string, string>>;
  id: string;
  omit?: string;
}): Files => ({
  [`rules/implementations/${input.id}.md`]: localBlock(
    Object.fromEntries(
      Object.entries({
        id: input.id,
        kind: 'implementation',
        summary: `The local ${input.id} block.`,
        chapters: '[]',
        requires: '[]',
        extends: 'null',
        abstract: 'false',
        checks: '[]',
        owns: '[]',
        governs: '[]',
        status: 'draft',
        ...input.fields,
      }).filter(([key]) => key !== input.omit),
    ),
  ),
});

const localPath = (id: string): string => `./rules/implementations/${id}.md`;

const PARAGLIDE = localPath('paraglide');

const paraglideFiles = (input: { omit?: string; requires?: string }): Files =>
  localBlockFiles({
    fields: {
      requires: input.requires ?? '[i18n, typescript]',
      summary: 'Paraglide messages, compiled per locale.',
      owns: '[Paraglide]',
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
    'domains: [ui, remote-data, i18n, analytics, version-control,',
    '          untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    'implementations: [react-dom, tanstack-query, matomo, biome, lefthook,',
    `                  gitleaks, ${PARAGLIDE}]`,
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
    'domains:',
    '  - version-control',
    '  - untrusted-client',
    'platforms:',
    '- cli',
    'languages: [typescript]',
    'implementations: [bun, biome, git, gitleaks]',
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
    'domains: [version-control]',
    'platforms: []',
    'languages: [typescript]',
    'implementations: [biome, lefthook, gitleaks]',
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
// summary, block lists, a constitution base and one block in an application.
const LOCAL_PROJECT: ProjectLayout = {
  config: [
    'version: 1.0.0',
    'domains: [version-control, ui, untrusted-client, unreliable-network]',
    'platforms: [browser]',
    'languages: [typescript]',
    `implementations: [react-dom, gitleaks, ${localPath('git-flow')}, ${localPath('lint-kit')}]`,
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
      'kind: implementation',
      'summary: "Git flow: a branch per change, a tag per release."',
      'chapters: []',
      'requires:',
      '  - version-control',
      'extends: git',
      'abstract: false',
      'checks: []',
      'owns: []',
      'governs: []',
      'status: draft',
      '---',
      '',
    ].join('\r\n'),
    'rules/implementations/lint-kit.md': [
      '---',
      'id: lint-kit',
      'kind: implementation',
      "summary: 'Lints TypeScript the way this team likes.'",
      'chapters: []',
      'requires:',
      '  - typescript',
      'extends: null',
      'abstract: false',
      'checks: [lint]',
      'owns: []',
      'governs: []',
      'status: stable',
      '---',
      '',
    ].join('\n'),
  },
};

const TEMPLATES = join(import.meta.dir, '..', '..', '..', 'templates');

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
    (text, [placeholder, value]) => text.replace(placeholder, value),
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
        `implementations: [git, gitleaks, ${PARAGLIDE}]`,
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

const syntheticProject = (blocks: number): ProjectLayout => ({
  config: configOf({
    domains: `[${Array.from(
      {
        length: blocks,
      },
      (_, index) => syntheticId(index + 1),
    ).join(', ')}]`,
  }),
});

export type { Config, ProjectLayout };
export {
  BROWSER_APP,
  CLI,
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
  removeProjects,
  syntheticProject,
};
