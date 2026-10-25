import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { coreText } from '../constitution.fixtures';
import { browserAppContext, everyCodeContext, unparsedContext } from '../digests.fixtures';
import type { Cut, HookRun, ListedOverride, Warning } from '../hook.fixtures';
import {
  BUDGET,
  bytesAfterHeader,
  contextOf,
  Edge,
  factNumberOf,
  HOOK_TODAY,
  HookEvent,
  indexOf,
  LEFT_OUT_RESERVE,
  listCutOf,
  mentionedOf,
  mustsOf,
  newSession,
  outputOf,
  overridesOf,
  pluginAtEdge,
  removeSessions,
  runHook,
  stateFolderOf,
  tellsTheUserOf,
  unknownIdsFilling,
  warningCutOf,
  warningsOf,
} from '../hook.fixtures';
import type { PluginRootOptions } from '../plugin-root.fixtures';
import {
  archiveOf,
  Breakage,
  createPluginRoot,
  createRealPluginRoot,
  LINK,
  linkArchive,
  releaseFormat,
  removePluginRoots,
} from '../plugin-root.fixtures';
import type { ProjectLayout } from '../project.fixtures';
import {
  browserApp,
  ConfigKey,
  cli,
  configOf,
  createProject,
  htmlSite,
  library,
  lineNumberOf,
  memberConfigOf,
  OWN_PACK,
  packBlockFiles,
  packPath,
  packProject,
  Repository,
  ratified,
  realCli,
  realWebApp,
  removeProjects,
  workspaceOf,
} from '../project.fixtures';

interface Place {
  cwd: string;
  projectDir?: string;
}

interface QuietCase extends Place {
  condition: string;
  layout: ProjectLayout;
  pluginRootUnset?: boolean;
}

interface FindCase extends Place {
  condition: string;
  nonUtf8Byte?: boolean;
  repository: Repository;
  spawnOutside?: boolean;
}

interface UnparsedCase {
  // a text of the line that does not parse
  at: string;
  condition: string;
  config: string;
}

interface UnparsedView {
  core: boolean;
  index: readonly string[];
  line: number;
  warnings: readonly Warning[];
}

interface QuotedCase {
  condition: string;
  domains: string;
  name: string;
}

interface WarningCase {
  condition: string;
  layout: ProjectLayout;
  warnings: readonly Warning[];
}

interface HeadingCase {
  event: HookEvent;
  tells: boolean;
}

interface GoldenCase {
  context: (archive: string) => string;
  layout: ProjectLayout;
  project: string;
}

interface IndexCase {
  index: readonly string[];
  layout: ProjectLayout;
  project: string;
}

interface EscapeCase {
  name: string;
  shown: string;
  what: string;
}

interface ReadCase {
  condition: string;
  config: string;
  count: number;
}

interface EdgeCase {
  condition: string;
  cut: Cut;
  edge: Edge;
  past: number;
}

interface WarningEdgeCase {
  condition: string;
  cut: Cut;
  past: number;
}

interface EventCase {
  event: HookEvent;
  name: string;
}

interface NoticeCase {
  condition: string;
  // what the case links into the project before the hook runs, which then links nothing over it
  link: (project: string) => void;
  // what the notice names: the archive and the command to run
  names: (archive: string) => readonly string[];
  plugin: PluginRootOptions;
  // no archive is linked into the project
  unlinked?: boolean | undefined;
}

interface FailureCase {
  condition: string;
  layout: ProjectLayout;
  // the file the line names, from the paths of the run; empty for a failure that names no file
  named: (paths: { archive: string; project: string }) => string;
  plugin: PluginRootOptions;
}

interface AxesView {
  index: readonly string[];
  musts: readonly string[];
  warnings: readonly Warning[];
}

interface AxesCase {
  condition: string;
  config: string;
  files?: ProjectLayout['files'];
  view: AxesView;
}

interface BlockListCase {
  condition: string;
  index: readonly string[];
  layout: ProjectLayout;
}

const found = configOf({
  domains: '[version-control]',
  implementations: '[git]',
});

const fourDataStatesOverride = (fields: string): string =>
  `\n  - rule: four-data-states\n${fields}`;

// A project that sets off a warning of every code.
const everyCode: ProjectLayout = {
  config: configOf({
    domains: '[analytics, version-control]',
    implementations: '[_react, tanstak-query, ui, matomo, git, react-dom]',
    languages: '[typescript]',
    omit: ConfigKey.Platforms,
    overrides: fourDataStatesOverride('    level: MAY\n    reason: "later"\n    until: 2020-01-01'),
    packs: '[packs/gone]',
  }),
};
const unparsedConfig = configOf({
  check: '&check bun run check',
});
// The block list of one domain is three lines: its layer's heading, the key, the domain.
const oneDomain: ProjectLayout = {
  config: configOf({
    domains: '[synthetic-001]',
  }),
};
const PROBE_ID = 'u01';
const DOCTOR = 'constitution doctor';
const FILLING_WARNINGS = 10;

const AXIS_DOMAINS = '[ui, remote-data, version-control]';
const DOMAINS = '## Domains';
const READS_ARE_CANCELLABLE = 'reads-are-cancellable';
const FOUR_DATA_STATES = 'four-data-states';
const LABELS_ON_FIELDS = 'labels-on-fields';
const belowFourDataStates = [
  'loading-state-shown',
  'skeleton-matches-content',
  'error-state-offers-retry',
];
const OPTIMISTIC_WRITES_ROLL_BACK = 'optimistic-writes-roll-back';
const COMMITS_ARE_ATOMIC = 'commits-are-atomic';
const everyAxis: AxesView = {
  musts: [
    READS_ARE_CANCELLABLE,
    FOUR_DATA_STATES,
    ...belowFourDataStates,
    LABELS_ON_FIELDS,
    OPTIMISTIC_WRITES_ROLL_BACK,
    COMMITS_ARE_ATOMIC,
  ],
  index: [
    DOMAINS,
    'remote-data (architecture: reads)',
    'ui (screens; architecture: forms, with/remote-data)',
    'version-control (workflow: commits)',
  ],
  warnings: [],
};
const baseOnly: AxesView = {
  musts: [
    FOUR_DATA_STATES,
    ...belowFourDataStates,
  ],
  index: [
    DOMAINS,
    'remote-data',
    'ui (screens)',
    'version-control',
  ],
  warnings: [],
};

const axesConfigOf = (axes: string): string =>
  configOf({
    axes,
    domains: '[ui, version-control]',
  });

// A workspace of packages/web, which follows the axes given and the repository's domains with
// remote-data.
const axesMemberOf = (axes: string): ProjectLayout['files'] =>
  workspaceOf({
    'packages/web': memberConfigOf({
      axes,
      domains: '[ui, version-control, remote-data]',
    }),
  });

const archiveIn = (project: string): string => join(project, LINK);

// runHook links the release's archive into a project that holds no link of its own.
const linkNothing = (): void => undefined;

let root = '';

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();
  removeSessions();
});

afterAll(() => {
  removePluginRoots();
});

describe('session-start hook', () => {
  it.each<QuietCase>([
    {
      condition: 'CLAUDE_PLUGIN_ROOT is unset',
      cwd: '',
      layout: cli,
      pluginRootUnset: true,
    },
    {
      condition: 'the repository holds no constitution.yaml',
      cwd: '',
      layout: {},
    },
    {
      condition: 'constitution.yaml lies only above the repository root',
      cwd: '',
      layout: {
        aboveConfig: found,
      },
    },
    {
      condition:
        'no repository holds the start folder and constitution.yaml lies only in its parent',
      cwd: '',
      layout: {
        aboveConfig: found,
        repository: Repository.None,
      },
    },
    {
      condition: 'CLAUDE_PROJECT_DIR names a folder that does not exist',
      cwd: '',
      layout: cli,
      projectDir: 'gone',
    },
  ])(
    'should print nothing and exit 0 when $condition',
    ({ cwd, layout, pluginRootUnset, projectDir }) => {
      // Arrange
      const project = createProject(layout);

      // Act
      const run = runHook({
        cwd,
        event: HookEvent.Startup,
        pluginRootUnset,
        project,
        projectDir,
        root,
      });

      // Assert
      expect(run).toStrictEqual<HookRun>({
        exitCode: 0,
        stderr: '',
        stdout: '',
      });
    },
  );

  it.each<FindCase>([
    {
      condition: 'CLAUDE_PROJECT_DIR names a subfolder of the repository',
      cwd: '..',
      projectDir: 'packages/app',
      repository: Repository.Folder,
    },
    {
      condition: 'cwd is a subfolder of a worktree, whose .git is a file',
      cwd: 'src/deep',
      repository: Repository.Worktree,
    },
    {
      condition: 'no repository holds the start folder and constitution.yaml lies in it',
      cwd: '',
      repository: Repository.None,
    },
    {
      condition: 'CLAUDE_PROJECT_DIR is a symbolic link to a subfolder of the repository',
      cwd: '..',
      projectDir: '../link',
      repository: Repository.Folder,
    },
    {
      condition: 'the process starts outside the cwd the event names',
      cwd: 'src/deep',
      repository: Repository.Folder,
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding a quote',
      cwd: 'q"b',
      repository: Repository.Folder,
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding a backslash',
      cwd: 'b\\s',
      repository: Repository.Folder,
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding a control byte',
      cwd: 'c\u0001x',
      repository: Repository.Folder,
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding non-ASCII text',
      cwd: 'crème',
      repository: Repository.Folder,
      spawnOutside: true,
    },
    {
      condition: 'the event holds a byte that is not UTF-8 and the locale is UTF-8',
      cwd: '',
      nonUtf8Byte: true,
      repository: Repository.Folder,
    },
  ])(
    'should find the project and count its blocks when $condition',
    ({ cwd, nonUtf8Byte, projectDir, repository, spawnOutside }) => {
      // Arrange
      const project = createProject({
        config: found,
        files: {
          'b\\s/.keep': '',
          'c\u0001x/.keep': '',
          'crème/.keep': '',
          'packages/app/.keep': '',
          'q"b/.keep': '',
          'src/deep/.keep': '',
        },
        links: {
          link: 'src/deep',
        },
        repository,
      });

      // Act
      const count = factNumberOf(
        contextOf(
          runHook({
            cwd,
            event: HookEvent.Subagent,
            nonUtf8Byte,
            project,
            projectDir,
            root,
            spawnOutside,
          }),
        ),
      );

      // Assert
      expect(count).toBe(3);
    },
  );

  it.each<UnparsedCase>([
    {
      at: '&check',
      condition: 'a value is an anchor',
      config: configOf({
        check: '&check bun run check',
      }),
    },
    {
      at: '*browser',
      condition: 'axes leaves architecture and workflow out and a later list item is an alias',
      config: configOf({
        axes: '[]',
        platforms: '[*browser]',
      }),
    },
    {
      at: '\t- ui',
      condition: 'a tab indents a line',
      config: configOf({
        domains: '\n\t- ui',
      }),
    },
    {
      at: 'domains: [ui,',
      condition: 'a flow list never closes',
      config: 'domains: [ui,\n  remote-data\n',
    },
    {
      at: 'check: |',
      condition: 'a value is a block scalar',
      config: configOf({
        check: '|\n  bun run check',
      }),
    },
    {
      at: '---',
      condition: 'a second document follows',
      config: `${configOf({})}---\ncheck: bun run check\n`,
    },
    {
      at: 'domains: [ui]',
      condition: 'a key is repeated',
      config: `${configOf({})}domains: [ui]\n`,
    },
    {
      at: 'ticket: X-1',
      condition: 'an override has a field outside the grammar',
      config: configOf({
        overrides: fourDataStatesOverride('    level: MAY\n    ticket: X-1'),
      }),
    },
    {
      at: '!!str',
      condition: 'a value carries a tag',
      config: configOf({
        check: '!!str bun run check',
      }),
    },
    {
      at: '{a: b}',
      condition: 'a flow list holds a flow mapping',
      config: configOf({
        domains: '[{a: b}]',
      }),
    },
    {
      at: '[i18n,',
      condition: 'a flow list nests another that runs on to the next line',
      config: 'domains: [ui, [i18n,\n  remote-data]]\n',
    },
    {
      at: '[ui,, i18n]',
      condition: 'a flow list has an empty item between two',
      config: configOf({
        domains: '[ui,, i18n]',
      }),
    },
    {
      at: 'remote-data]',
      condition: 'a flow list goes on at the start of a line',
      config: 'domains: [ui,\nremote-data]\n',
    },
    {
      at: 'check:bun',
      condition: 'a key has no space after its colon',
      config: `${configOf({
        omit: ConfigKey.Check,
      })}check:bun run check\n`,
    },
    {
      at: 'level: SHOULD',
      condition: "an override's field is repeated",
      config: configOf({
        overrides: fourDataStatesOverride('    level: MAY\n    level: SHOULD'),
      }),
    },
    {
      at: '      level: MAY',
      condition: "an override's field is indented past its item",
      config: configOf({
        overrides: fourDataStatesOverride('      level: MAY'),
      }),
    },
  ])('should name the line and give only core when $condition', ({ at, config }) => {
    // Arrange
    const project = createProject({
      config,
    });

    // Act
    const context = contextOf(
      runHook({
        project,
        event: HookEvent.Startup,
        root,
      }),
    );

    // Assert
    expect({
      core: context.includes(coreText),
      index: indexOf(context),
      line: factNumberOf(context),
      warnings: warningsOf({
        context,
        like: [],
      }),
    }).toStrictEqual<UnparsedView>({
      core: true,
      index: [],
      line: lineNumberOf({
        at,
        config,
      }),
      warnings: [],
    });
  });

  it.each<ReadCase>([
    {
      condition: 'CRLF line ends',
      config: found.replaceAll('\n', '\r\n'),
      count: 3,
    },
    {
      condition: 'a document marker on its first line',
      config: `---\n${found}`,
      count: 3,
    },
    {
      condition: 'a flow list that ends with a comma',
      config: configOf({
        domains: '[version-control, ]',
        implementations: '[git,]',
      }),
      count: 3,
    },
    {
      condition: 'empty flow collections with blanks inside',
      config: configOf({
        domains: '[ ]',
        overrides: '[ ]',
      }),
      count: 1,
    },
    {
      condition: 'a block listed under the wrong key',
      config: configOf({
        implementations: '[ui]',
      }),
      count: 2,
    },
  ])('should read constitution.yaml when it holds $condition', ({ config, count }) => {
    // Arrange
    const project = createProject({
      config,
    });

    // Act
    const printed = factNumberOf(
      contextOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root,
        }),
      ),
    );

    // Assert
    expect(printed).toBe(count);
  });

  it('should take the farthest constitution.yaml of the repository when two lie on the way up', () => {
    // Arrange
    const project = createProject({
      config: found,
      files: {
        'sub/constitution.yaml': configOf({
          domains: '[ui]',
        }),
        'sub/deep/.keep': '',
      },
    });

    linkArchive({
      archive: archiveOf(root),
      project: join(project, 'sub'),
    });

    // Act
    const count = factNumberOf(
      contextOf(
        runHook({
          cwd: 'sub/deep',
          event: HookEvent.Subagent,
          project,
          root,
        }),
      ),
    );

    // Assert
    expect(count).toBe(3);
  });

  it('should read the files without a warning when they are written from the templates', () => {
    // Arrange
    const project = createProject(ratified);

    // Act
    const context = contextOf(
      runHook({
        event: HookEvent.Startup,
        project,
        root,
      }),
    );

    // Assert
    expect({
      count: factNumberOf(context),
      index: indexOf(context),
      warnings: warningsOf({
        context,
        like: [],
      }),
    }).toStrictEqual({
      count: 7,
      index: [
        '## Domains',
        'i18n (plurals)',
        'version-control (workflow: commits)',
        '## Languages',
        'typescript (types)',
        '## Implementations',
        'betterleaks',
        'git (workflow: tags)',
        'paraglide [constitution] (messages)',
      ],
      warnings: [],
    });
  });

  it.each<QuotedCase>([
    {
      condition: 'a "#" and a ":" in a double-quoted value',
      domains: '["u #7: x"]',
      name: 'u #7: x',
    },
    {
      condition: 'a "#" with no blank before it',
      domains: '[u#7]',
      name: 'u#7',
    },
    {
      condition: 'escaped quotes and backslashes in a double-quoted value',
      domains: '["u\\"7\\\\x"]',
      name: 'u"7\\x',
    },
    {
      condition: 'a doubled quote in a single-quoted value',
      domains: "['u''7']",
      name: "u'7",
    },
  ])('should read a quoted name as YAML does when it holds $condition', ({ domains, name }) => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains,
      }),
    });

    // Act
    const context = contextOf(
      runHook({
        event: HookEvent.Subagent,
        project,
        root,
      }),
    );

    // Assert
    expect(
      warningsOf({
        context,
        like: [
          [
            'blocks',
            name,
          ],
        ],
      }),
    ).toStrictEqual([
      [
        'blocks',
        name,
      ],
    ]);
  });

  it.each<HeadingCase>([
    {
      event: HookEvent.Startup,
      tells: true,
    },
    {
      event: HookEvent.Clear,
      tells: false,
    },
  ])(
    'should ask to tell the user of the warnings only at startup when the event is $event',
    ({ event, tells }) => {
      // Arrange
      const project = createProject({
        config: configOf({
          domains: '[tanstak-query]',
        }),
      });

      // Act
      const context = contextOf(
        runHook({
          project,
          event,
          root,
        }),
      );

      // Assert
      expect(tellsTheUserOf(context)).toBe(tells);
    },
  );

  it.each<WarningCase>([
    {
      condition: 'a block lacks a block it requires',
      layout: {
        config: configOf({
          domains: '[untrusted-client, unreliable-network]',
          implementations: '[react-dom]',
          platforms: '[browser]',
        }),
      },
      warnings: [
        [
          'requirements',
          '_react',
          'ui',
        ],
      ],
    },
    {
      condition: 'a block requires an abstract block no heir brings',
      layout: {
        config: configOf({
          domains: '[remote-data]',
          implementations: '[tanstack-query]',
        }),
      },
      warnings: [
        [
          'requirements',
          'tanstack-query',
          '_react',
          'react-dom',
        ],
      ],
    },
    {
      condition: "a member's block lacks a block it requires",
      layout: {
        config: configOf({}),
        files: workspaceOf({
          web: memberConfigOf({
            domains: '[untrusted-client, unreliable-network]',
            implementations: '[react-dom]',
            platforms: '[browser]',
          }),
        }),
      },
      warnings: [
        [
          'requirements',
          '_react',
          'web',
          'ui',
        ],
      ],
    },
    {
      condition: 'core is listed',
      layout: {
        config: configOf({
          domains: '[core]',
        }),
      },
      warnings: [
        [
          'blocks',
          'core',
          'domains',
        ],
      ],
    },
    {
      condition: 'check is empty',
      layout: {
        config: configOf({
          check: '""',
        }),
      },
      warnings: [
        [
          'config',
          'check',
        ],
      ],
    },
    {
      condition: 'a list key holds nothing',
      layout: {
        config: configOf({
          domains: '',
        }),
      },
      warnings: [
        [
          'config',
          'domains',
        ],
      ],
    },
    {
      condition: 'an override has no reason',
      layout: {
        config: configOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride('    level: MAY'),
        }),
      },
      warnings: [
        [
          'overrides',
          'reason',
        ],
      ],
    },
    {
      condition: 'an override sets a level that lowers nothing',
      layout: {
        config: configOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride('    level: MUST\n    reason: "kept"'),
        }),
      },
      warnings: [
        [
          'overrides',
          'four-data-states',
          'MUST',
        ],
      ],
    },
    {
      condition: 'a block is listed by its path',
      layout: {
        config: configOf({
          implementations: '[./rules/implementations/paraglide.md]',
        }),
      },
      warnings: [
        [
          'blocks',
          './rules/implementations/paraglide.md',
        ],
      ],
    },
    {
      condition: 'a block of the pack requires a block of the pack active only in a member',
      layout: {
        config: configOf({
          implementations: '[alpha]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
          ...workspaceOf({
            'packages/x': memberConfigOf({
              implementations: '[beta]',
              packs: `[../../${OWN_PACK}]`,
            }),
          }),
          ...packBlockFiles({
            fields: {
              requires: '[beta]',
            },
            id: 'alpha',
          }),
          ...packBlockFiles({
            id: 'beta',
          }),
        },
      },
      warnings: [
        [
          'requirements',
          'alpha',
          'beta',
        ],
      ],
    },
    {
      condition: "a block's card in the pack is a folder",
      layout: {
        config: configOf({
          implementations: '[folder]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
          [`${packPath({
            id: 'folder',
          })}/.keep`]: '',
        },
      },
      warnings: [
        [
          'blocks',
          'folder',
        ],
      ],
    },
    {
      condition: "a block's card in the pack is a named pipe",
      layout: {
        config: configOf({
          implementations: '[pipe]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
          [`${OWN_PACK}/blocks/implementations/pipe/.keep`]: '',
        },
        namedPipes: [
          packPath({
            id: 'pipe',
          }),
        ],
      },
      warnings: [
        [
          'blocks',
          'pipe',
        ],
      ],
    },
    {
      condition: 'an id is listed twice',
      layout: {
        config: configOf({
          domains: '[nope, nope]',
        }),
      },
      warnings: [
        [
          'blocks',
          'nope',
        ],
      ],
    },
    {
      condition: 'a member lists none of the blocks of the repository that lack a block',
      layout: {
        config: configOf({
          domains: '[untrusted-client, unreliable-network]',
          implementations: '[react-dom]',
          platforms: '[browser]',
        }),
        files: workspaceOf({
          web: memberConfigOf({
            domains: '[i18n]',
          }),
        }),
      },
      warnings: [
        [
          'requirements',
          '_react',
          'ui',
        ],
      ],
    },
    {
      condition: 'every code applies',
      layout: everyCode,
      warnings: [
        [
          'config',
          'platforms',
        ],
        [
          'blocks',
          '_react',
          'react-dom',
        ],
        [
          'blocks',
          'tanstak-query',
        ],
        [
          'blocks',
          'ui',
          'implementations',
          'domains',
        ],
        [
          'requirements',
          'react-dom',
          'browser',
        ],
        [
          'requirements',
          'matomo',
          'analytics-consent-first',
        ],
        [
          'overrides',
          'four-data-states',
          '2020-01-01',
        ],
        [
          'installation',
          'packs/gone',
        ],
      ],
    },
    {
      condition: 'a key holds a block the grammar does not know',
      layout: {
        config: `${configOf({})}skip:\n  - react-dom\n  - nested: [x]\n`,
      },
      warnings: [
        [
          'config',
          'skip',
        ],
      ],
    },
    {
      condition: "a member's key holds nothing",
      layout: {
        config: configOf({}),
        files: workspaceOf({
          web: memberConfigOf({
            domains: '',
          }),
        }),
      },
      warnings: [
        [
          'config',
          'web/constitution.yaml',
          'domains',
        ],
      ],
    },
    {
      condition: 'packs is left out',
      layout: {
        config: configOf({
          omit: ConfigKey.Packs,
        }),
      },
      warnings: [
        [
          'config',
          'packs',
        ],
      ],
    },
    {
      condition: 'packs holds nothing',
      layout: {
        config: configOf({
          packs: '',
        }),
      },
      warnings: [
        [
          'config',
          'packs',
        ],
      ],
    },
    {
      condition: 'a version key is left from an older release',
      layout: {
        config: `version: 1.0.0\n${configOf({})}`,
      },
      warnings: [
        [
          'config',
          'version',
        ],
      ],
    },
    {
      condition: "the repository still names its packages' blocks",
      layout: {
        config: `${configOf({})}packages:\n  web:\n    domains: [ui]\n`,
      },
      warnings: [
        [
          'config',
          'packages',
        ],
      ],
    },
    {
      condition: 'a member keeps no constitution.yaml, and another one that does not parse',
      layout: {
        config: configOf({}),
        files: {
          ...workspaceOf({
            api: 'domains: [ui\n',
          }),
          'package.json': '{"workspaces": ["api", "web"]}\n',
          'web/package.json': '{}\n',
        },
      },
      warnings: [
        [
          'config',
          'api/constitution.yaml',
          '1',
        ],
        [
          'workspace',
          'web',
          'constitution.yaml',
        ],
      ],
    },
    {
      condition: "an override's until is no date",
      layout: {
        config: configOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride('    level: MAY\n    reason: "later"\n    until: soon'),
        }),
      },
      warnings: [
        [
          'overrides',
          'four-data-states',
          'soon',
        ],
      ],
    },
    {
      condition: 'an override has only a reason',
      layout: {
        config: configOf({
          overrides: '\n  - reason: "later"',
        }),
      },
      warnings: [
        [
          'overrides',
          'rule',
          'level',
        ],
      ],
    },
    {
      condition: "a block of the pack lies in the folder of a layer other than its key's",
      layout: {
        config: configOf({
          implementations: '[kit]',
          packs: `[${OWN_PACK}]`,
        }),
        files: packBlockFiles({
          folder: 'domains',
          id: 'kit',
        }),
      },
      warnings: [
        [
          'blocks',
          'kit',
          'implementations',
          'domains',
        ],
      ],
    },
    {
      condition: 'a block of the pack takes the id of a Constitution block',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git]',
          packs: `[${OWN_PACK}]`,
        }),
        files: packBlockFiles({
          id: 'git',
        }),
      },
      warnings: [
        [
          'packs',
          packPath({
            id: 'git',
          }),
          'git',
        ],
      ],
    },
    {
      condition:
        'rules of the pack name a rule of the Constitution and a rule of a block of the pack read after them',
      layout: {
        config: configOf({
          implementations: '[kit, kit-base]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
          ...packBlockFiles({
            headings: [
              '### kit-rule → secret-never-in-code',
              '### kit-child → base-rule · MUST',
            ],
            id: 'kit',
          }),
          ...packBlockFiles({
            headings: [
              '### base-rule · MUST',
            ],
            id: 'kit-base',
          }),
        },
      },
      warnings: [],
    },
    {
      condition: "a block's card in the pack has no front matter",
      layout: {
        config: configOf({
          implementations: '[kit]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
          [packPath({
            id: 'kit',
          })]: '# Kit\n',
        },
      },
      warnings: [
        [
          'packs',
          packPath({
            id: 'kit',
          }),
        ],
      ],
    },
    {
      condition: "a block's card in the pack cannot be read",
      layout: {
        config: configOf({
          implementations: '[kit]',
          packs: `[${OWN_PACK}]`,
        }),
        files: packBlockFiles({
          id: 'kit',
        }),
        unreadable: [
          packPath({
            id: 'kit',
          }),
        ],
      },
      warnings: [
        [
          'packs',
          packPath({
            id: 'kit',
          }),
        ],
      ],
    },
    {
      condition:
        "a block's card in the pack requires and extends what is no block, and extends a concrete block",
      layout: {
        config: configOf({
          implementations: '[kit, tool]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
          ...packBlockFiles({
            id: 'kit',
          }),
          [packPath({
            id: 'kit',
          })]:
            '---\nid: kit\nsummary: "Kit."\nrequires: [nothing-here]\nextends: ghost\nabstract: false\nlanguages: []\ngoverns: []\n---\n\n# Kit\n',
          [packPath({
            id: 'tool',
          })]:
            '---\nid: tool\nsummary: "Tool."\nrequires: []\nextends: git\nabstract: false\nlanguages: []\ngoverns: []\n---\n\n# Tool\n',
        },
      },
      warnings: [
        [
          'requirements',
          'git',
          'version-control',
        ],
        [
          'packs',
          'kit',
          'nothing-here',
        ],
        [
          'packs',
          'kit',
          'ghost',
        ],
        [
          'packs',
          'tool',
          'git',
        ],
      ],
    },
    {
      condition: 'an override ends today',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git]',
          languages: '[typescript]',
          overrides: `\n  - rule: secret-never-in-code\n    level: MAY\n    reason: "none yet"\n    until: ${HOOK_TODAY}`,
        }),
      },
      warnings: [],
    },
    {
      condition: "a member's override lowers the requirement its library does not meet",
      layout: {
        config: configOf({}),
        files: workspaceOf({
          web: memberConfigOf({
            domains: '[analytics]',
            implementations: '[matomo]',
            overrides:
              '\n  - rule: analytics-consent-first\n    level: SHOULD\n    reason: "no banner yet"',
          }),
        }),
      },
      warnings: [],
    },
    {
      condition: 'a member leaves out the library that misses a requirement',
      layout: {
        config: configOf({
          domains: '[analytics]',
          implementations: '[matomo]',
        }),
        files: workspaceOf({
          web: memberConfigOf({
            domains: '[ui]',
          }),
        }),
      },
      warnings: [
        [
          'requirements',
          'matomo',
          'analytics-consent-first',
        ],
      ],
    },
    {
      condition: 'an override names no rule',
      layout: {
        config: configOf({
          overrides: '\n  - rule: four-states\n    level: MAY\n    reason: "later"',
        }),
      },
      warnings: [
        [
          'overrides',
          'four-states',
        ],
      ],
    },
    {
      condition: 'the override of the requirement a library misses has expired',
      layout: {
        config: configOf({
          domains: '[analytics]',
          implementations: '[matomo]',
          overrides:
            '\n  - rule: analytics-consent-first\n    level: SHOULD\n    reason: "later"\n    until: 2020-01-01',
        }),
      },
      warnings: [
        [
          'requirements',
          'matomo',
          'analytics-consent-first',
        ],
        [
          'overrides',
          'analytics-consent-first',
          '2020-01-01',
        ],
      ],
    },
  ])('should warn of each code and name as listed when $condition', ({ layout, warnings }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const context = contextOf(
      runHook({
        project,
        event: HookEvent.Subagent,
        root,
      }),
    );

    // Assert
    expect(
      warningsOf({
        context,
        like: warnings,
      }),
    ).toStrictEqual(warnings);
  });

  it.each<WarningEdgeCase>([
    {
      condition: 'the warnings fill 1,000 bytes exactly',
      cut: {
        kept: FILLING_WARNINGS,
        leftOut: 0,
      },
      past: 0,
    },
    {
      condition: 'the warnings pass 1,000 bytes by one byte',
      cut: {
        kept: FILLING_WARNINGS - 1,
        leftOut: 1,
      },
      past: 1,
    },
  ])('should print warnings up to 1,000 bytes when $condition', ({ cut, past }) => {
    // Arrange
    const probe = contextOf(
      runHook({
        project: createProject({
          config: configOf({
            domains: `[${PROBE_ID}]`,
          }),
        }),
        event: HookEvent.Subagent,
        root,
      }),
    );
    const project = createProject({
      config: configOf({
        domains: `[${unknownIdsFilling({
          count: FILLING_WARNINGS,
          past,
          probe,
          probeId: PROBE_ID,
        }).join(', ')}]`,
      }),
    });

    // Act
    const context = contextOf(
      runHook({
        project,
        event: HookEvent.Subagent,
        root,
      }),
    );

    // Assert
    expect(warningCutOf(context)).toStrictEqual<Cut>(cut);
  });

  it.each<GoldenCase>([
    {
      context: browserAppContext,
      layout: browserApp,
      project: 'a browser application with a block of its own pack and an override',
    },
    {
      context: everyCodeContext,
      layout: everyCode,
      project: 'one that sets off a warning of every code',
    },
    {
      context: (archive): string =>
        unparsedContext({
          line: lineNumberOf({
            at: '&check',
            config: unparsedConfig,
          }),
          root: archive,
        }),
      layout: {
        config: unparsedConfig,
      },
      project: 'one whose constitution.yaml does not parse',
    },
  ])('should give the digest word for word when the project is $project', ({ context, layout }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const printed = contextOf(
      runHook({
        project,
        event: HookEvent.Startup,
        root,
      }),
    );

    // Assert
    expect(printed).toBe(context(archiveIn(project)));
  });

  it.each<IndexCase>([
    {
      index: [
        '## Domains',
        'untrusted-client (secrets)',
        'version-control (workflow: commits)',
        '## Platforms',
        'cli (exits)',
        '## Languages',
        'typescript (types)',
        '## Implementations',
        'betterleaks',
        'biome',
        'bun (workflow: lockfile)',
        'git (workflow: tags)',
      ],
      layout: cli,
      project: 'a command-line program',
    },
    {
      index: [
        '## Domains',
        'version-control (workflow: commits)',
        '## Languages',
        'typescript (types)',
        '## Implementations',
        'betterleaks',
        'biome',
        'git (workflow: tags)',
        'lefthook (workflow: hooks)',
        '## packages/react-kit',
        'ui [domains] (screens; architecture: forms)',
        'unreliable-network [domains] (retries)',
        'untrusted-client [domains] (secrets)',
        'browser [contexts/platforms] (architecture: render)',
        '_react [implementations] (hooks)',
        'react-dom [implementations] (architecture: portals)',
      ],
      layout: library,
      project: 'a library whose package is an application with its override',
    },
    {
      index: [
        '## Domains',
        'ui (screens; architecture: forms)',
        'unreliable-network (retries)',
        'untrusted-client (secrets)',
        'version-control (workflow: commits)',
        '## Platforms',
        'browser (architecture: render)',
        '## Languages',
        'typescript (types)',
        '## Implementations',
        '_lint-base',
        '_react (hooks)',
        'betterleaks',
        'git (workflow: tags)',
        'react-dom (architecture: portals)',
        'git-flow [constitution]',
        'lint-kit [constitution]',
        '## packages/web',
        'i18n [domains] (plurals)',
        'paraglide [implementations]',
      ],
      layout: packProject,
      project: 'one with a pack of its own, one of its blocks in an application',
    },
    {
      index: [
        '## Domains',
        'ui (screens; architecture: forms)',
        'unreliable-network (retries)',
        'untrusted-client (secrets)',
        'version-control (workflow: commits)',
        '## Platforms',
        'browser (architecture: render)',
        '## Implementations',
        'git (workflow: tags)',
      ],
      layout: htmlSite,
      project: 'a plain HTML site in no language',
    },
  ])('should list the blocks in index order when the project is $project', ({ index, layout }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const printed = indexOf(
      contextOf(
        runHook({
          project,
          event: HookEvent.Startup,
          root,
        }),
      ),
    );

    // Assert
    expect(printed).toStrictEqual(index);
  });

  it.each([
    {
      layout: realWebApp,
      shape: 'the reference web application',
    },
    {
      layout: realCli,
      shape: 'the reference command-line tool',
    },
  ])(
    'should keep the digest within 9,400 bytes, list every block and warn of nothing when $shape follows the real blocks',
    ({ layout }) => {
      // Arrange
      const project = createProject(layout);

      // Act
      const context = contextOf(
        runHook({
          project,
          event: HookEvent.Subagent,
          root: createRealPluginRoot(),
        }),
      );

      // Assert
      expect({
        isWithinBudget: bytesAfterHeader(context) <= BUDGET,
        leftOut: listCutOf(context).leftOut,
        warnings: warningsOf({
          context,
          like: [],
        }),
      }).toStrictEqual({
        isWithinBudget: true,
        leftOut: 0,
        warnings: [],
      });
    },
  );

  it.each<EscapeCase>([
    {
      name: '1.0\\0',
      shown: '1.0\\0',
      what: 'a backslash',
    },
    {
      name: '1.0"0',
      shown: '1.0"0',
      what: 'a quote',
    },
    {
      name: '1.0\t0',
      shown: '1.0\t0',
      what: 'a tab',
    },
    {
      name: '1.0\u001f0',
      shown: '1.0\u001f0',
      what: 'the control byte 0x1f',
    },
    {
      name: '1.0\r0',
      shown: '1.00',
      what: 'a carriage return, which the context drops',
    },
    {
      name: '1.0-naïve-крок',
      shown: '1.0-naïve-крок',
      what: 'non-ASCII text',
    },
  ])(
    'should print one valid JSON object that keeps a name when it holds $what',
    ({ name, shown }) => {
      // Arrange
      const project = createProject({
        config: configOf({
          domains: `[${name}]`,
        }),
      });

      // Act
      const output = outputOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root,
        }),
      );

      // Assert
      expect({
        event: output.event,
        warnings: warningsOf({
          context: output.context,
          like: [
            [
              'blocks',
              shown,
            ],
          ],
        }),
      }).toStrictEqual({
        event: 'SubagentStart',
        warnings: [
          [
            'blocks',
            shown,
          ],
        ],
      });
    },
  );

  it('should escape DEL as \\u007f when a name holds it', () => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains: '[1.0\u007f0]',
      }),
    });

    // Act
    const run = runHook({
      event: HookEvent.Subagent,
      project,
      root,
    });

    // Assert
    expect(run.stdout).toContain('1.0\\u007f0');
  });

  it("should mark a rule with every override of it, the repository's first, when a project and its member override rules", () => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains: '[ui]',
        overrides: fourDataStatesOverride('    level: MAY\n    reason: "a prototype"'),
      }),
      files: workspaceOf({
        web: memberConfigOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride('    level: SHOULD\n    reason: "the kit decides"'),
        }),
      }),
    });
    // the rule's slug, then each level that lowers it, the repository's first, each member named
    const marked = 'four-data-states (MAY; SHOULD in web)';

    const session = newSession();

    // Act
    runHook({
      event: HookEvent.Compact,
      project,
      root,
      session,
    });

    // Assert
    expect(mustsOf(session)).toContain(marked);
  });

  // Each case measures the digest of its project under the default core, then
  // sizes a core of its own to put the edge where it needs it.
  it.each<EdgeCase>([
    {
      condition: 'the last line of the block list ends on the budget, reserve kept',
      cut: {
        kept: 3,
        leftOut: 0,
      },
      edge: Edge.LastLine,
      past: 0,
    },
    {
      condition: 'the last line of the block list passes the budget by one byte',
      cut: {
        kept: 2,
        leftOut: 1,
      },
      edge: Edge.LastLine,
      past: 1,
    },
    {
      condition: 'the heading of the block list ends on the budget',
      cut: {
        kept: 1,
        leftOut: 2,
      },
      edge: Edge.Heading,
      past: 0,
    },
    {
      condition: 'the heading of the block list passes the budget by one byte',
      cut: {
        kept: 0,
        leftOut: 3,
      },
      edge: Edge.Heading,
      past: 1,
    },
  ])('should cut where the budget ends when $condition', ({ cut, edge, past }) => {
    // Arrange
    const plugin = pluginAtEdge({
      context: contextOf(
        runHook({
          event: HookEvent.Startup,
          project: createProject(oneDomain),
          root,
        }),
      ),
      edge,
      past,
    });
    const project = createProject(oneDomain);

    // Act
    const context = contextOf(
      runHook({
        event: HookEvent.Startup,
        project,
        root: plugin,
      }),
    );

    // Assert
    expect(listCutOf(context)).toStrictEqual<Cut>(cut);
  });

  it("should list every override, the repository's and its member's, when the block list does not fit at all", () => {
    // Arrange
    const layout = {
      config: configOf({
        domains: '[ui]',
        overrides: fourDataStatesOverride('    level: MAY\n    reason: "a prototype"'),
      }),
      files: workspaceOf({
        web: memberConfigOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride('    level: SHOULD\n    reason: "the kit decides"'),
        }),
      }),
    };
    const plugin = pluginAtEdge({
      context: contextOf(
        runHook({
          event: HookEvent.Startup,
          project: createProject(layout),
          root,
        }),
      ),
      edge: Edge.Heading,
      past: 1,
    });
    const project = createProject(layout);

    // Act
    const context = contextOf(
      runHook({
        event: HookEvent.Startup,
        project,
        root: plugin,
      }),
    );

    // Assert
    expect({
      kept: listCutOf(context).kept,
      overrides: overridesOf(context),
    }).toStrictEqual({
      kept: 0,
      overrides: [
        [
          'four-data-states',
          'MAY',
        ],
        [
          'four-data-states',
          'SHOULD',
        ],
      ] satisfies ListedOverride[],
    });
  });

  it('should fill the budget to its last byte when the last line of the block list ends on it', () => {
    // Arrange
    const plugin = pluginAtEdge({
      context: contextOf(
        runHook({
          event: HookEvent.Startup,
          project: createProject(oneDomain),
          root,
        }),
      ),
      edge: Edge.LastLine,
      past: 0,
    });
    const project = createProject(oneDomain);

    // Act
    const bytes = bytesAfterHeader(
      contextOf(
        runHook({
          event: HookEvent.Startup,
          project,
          root: plugin,
        }),
      ),
    );

    // Assert
    expect(bytes).toBe(BUDGET - LEFT_OUT_RESERVE);
  });

  it.each<EventCase>([
    {
      event: HookEvent.Startup,
      name: 'SessionStart',
    },
  ])('should name the event $name when the hook runs at $event', ({ event, name }) => {
    // Arrange
    const project = createProject(cli);

    // Act
    const output = outputOf(
      runHook({
        project,
        event,
        root,
      }),
    );

    // Assert
    expect(output.event).toBe(name);
  });

  it.each<NoticeCase>(
    [
      {
        condition: 'the project holds no archive',
        link: linkNothing,
        plugin: {},
        unlinked: true,
      },
      {
        condition: "the project's archive link points nowhere",
        link: (project: string): void => {
          linkArchive({
            archive: join(project, 'gone'),
            project,
          });
        },
        plugin: {},
      },
      {
        condition:
          'the archive is a release from before block format 2, whose package.json names none',
        link: linkNothing,
        plugin: {
          breakage: Breakage.Format,
        },
      },
      {
        condition: 'the block format is older than the oldest the plugin reads',
        link: linkNothing,
        plugin: {
          format: releaseFormat - 1,
        },
      },
      {
        condition: 'the block format is written as text',
        link: linkNothing,
        plugin: {
          format: String(releaseFormat),
        },
      },
      {
        condition: 'the block format is newer than the plugin reads',
        link: linkNothing,
        plugin: {
          format: releaseFormat + 1,
        },
      },
    ].map((notice: Omit<NoticeCase, 'names'>) => ({
      ...notice,
      // the one line names the archive and the command that says what is wrong
      names: (archive: string): readonly string[] => [
        archive,
        DOCTOR,
      ],
    })),
  )(
    'should point to doctor in one line and save no state when $condition',
    ({ link, names, plugin, unlinked }) => {
      // Arrange
      const pluginRoot = createPluginRoot(plugin);
      const project = createProject(cli);
      const session = newSession();

      link(project);

      // Act
      const run = runHook({
        event: HookEvent.Startup,
        project,
        root: pluginRoot,
        session,
        unlinked,
      });

      // Assert
      const context = contextOf(run);

      expect({
        exitCode: run.exitCode,
        mentioned: mentionedOf({
          names: names(archiveIn(project)),
          text: context,
        }),
        rules: context.includes(coreText),
        saved: existsSync(stateFolderOf(session)),
        stderr: run.stderr,
      }).toStrictEqual({
        exitCode: 0,
        mentioned: names(archiveIn(project)),
        rules: false,
        saved: false,
        stderr: '',
      });
    },
  );

  it('should give the digest when the block format is the newest the plugin reads', () => {
    // Arrange
    const plugin = createPluginRoot({
      format: releaseFormat,
    });
    const project = createProject(cli);

    // Act
    const count = factNumberOf(
      contextOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root: plugin,
        }),
      ),
    );

    // Assert
    expect(count).toBe(9);
  });

  it.each<FailureCase>([
    {
      condition: 'the archive lacks package.json',
      layout: cli,
      named: ({ archive }): string => `${archive}/package.json`,
      plugin: {
        breakage: Breakage.Manifest,
      },
    },
    {
      condition: "the archive lacks core's card",
      layout: cli,
      named: (): string => '',
      plugin: {
        breakage: Breakage.Core,
      },
    },
    {
      condition: "the archive's package.json has no version",
      layout: cli,
      named: ({ archive }): string => `${archive}/package.json`,
      plugin: {
        breakage: Breakage.Version,
      },
    },
    {
      condition: 'constitution.yaml cannot be read',
      layout: {
        ...cli,
        unreadable: [
          'constitution.yaml',
        ],
      },
      named: ({ project }): string => `${project}/constitution.yaml`,
      plugin: {},
    },
  ])(
    'should write one line of the hook to stderr, naming the file it stopped at, and exit 1 when $condition',
    ({ layout, named, plugin }) => {
      // Arrange
      const pluginRoot = createPluginRoot(plugin);
      const project = createProject(layout);
      const file = named({
        archive: archiveIn(project),
        project,
      });

      // Act
      const run = runHook({
        event: HookEvent.Startup,
        project,
        root: pluginRoot,
      });

      // Assert
      expect({
        exitCode: run.exitCode,
        lines: run.stderr.trimEnd().split('\n').length,
        namesFile: run.stderr.includes(file),
        opensAsTheHook: run.stderr.startsWith('constitution hook: '),
        stdout: run.stdout,
      }).toStrictEqual({
        exitCode: 1,
        lines: 1,
        namesFile: true,
        opensAsTheHook: true,
        stdout: '',
      });
    },
  );

  it('should write the line of the hook word for word when the archive lacks package.json', () => {
    // Arrange
    const plugin = createPluginRoot({
      breakage: Breakage.Manifest,
    });
    const project = createProject(cli);

    // Act
    const run = runHook({
      event: HookEvent.Startup,
      project,
      root: plugin,
    });

    // Assert
    expect(run).toStrictEqual<HookRun>({
      exitCode: 1,
      stderr: `constitution hook: cannot read ${archiveIn(project)}/package.json\n`,
      stdout: '',
    });
  });

  it.each<BlockListCase>([
    {
      condition: "a block's with/ file is active only in a member",
      layout: {
        config: configOf({
          domains: '[ui]',
        }),
        files: workspaceOf({
          'packages/web': memberConfigOf({
            domains: '[ui, remote-data]',
          }),
        }),
      },
      index: [
        DOMAINS,
        'ui (screens; architecture: forms)',
        '## packages/web',
        'remote-data [domains] (architecture: reads)',
        'ui [domains] (architecture: with/remote-data)',
      ],
    },
  ])('should list the active blocks as given when $condition', ({ index, layout }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const list = indexOf(
      contextOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root,
        }),
      ),
    );

    // Assert
    expect(list).toStrictEqual(index);
  });

  it.each<AxesCase>([
    {
      condition: 'the repository follows all three axes',
      config: configOf({
        domains: AXIS_DOMAINS,
      }),
      view: everyAxis,
    },
    {
      condition: 'the repository follows only the base',
      config: configOf({
        axes: '[]',
        domains: AXIS_DOMAINS,
      }),
      view: baseOnly,
    },
    {
      condition: 'constitution.yaml has no axes key',
      config: configOf({
        domains: AXIS_DOMAINS,
        omit: ConfigKey.Axes,
      }),
      view: {
        ...everyAxis,
        warnings: [
          [
            'config',
            'axes',
          ],
        ],
      },
    },
    {
      condition: 'axes names an axis that does not exist',
      config: configOf({
        axes: '[design]',
        domains: AXIS_DOMAINS,
      }),
      view: {
        ...baseOnly,
        warnings: [
          [
            'config',
            'design',
          ],
        ],
      },
    },
    {
      condition: 'axes lists foundation',
      config: configOf({
        axes: '[foundation, architecture]',
        domains: AXIS_DOMAINS,
      }),
      view: {
        musts: [
          READS_ARE_CANCELLABLE,
          FOUR_DATA_STATES,
          ...belowFourDataStates,
          LABELS_ON_FIELDS,
          OPTIMISTIC_WRITES_ROLL_BACK,
        ],
        index: [
          DOMAINS,
          'remote-data (architecture: reads)',
          'ui (screens; architecture: forms, with/remote-data)',
          'version-control',
        ],
        warnings: [
          [
            'config',
            'foundation',
          ],
        ],
      },
    },
    {
      condition:
        "a member follows an axis the repository leaves out, for its own block and one of the repository's",
      config: axesConfigOf('[]'),
      files: axesMemberOf('[architecture]'),
      view: {
        musts: [
          READS_ARE_CANCELLABLE,
          FOUR_DATA_STATES,
          ...belowFourDataStates,
          LABELS_ON_FIELDS,
          OPTIMISTIC_WRITES_ROLL_BACK,
        ],
        index: [
          DOMAINS,
          'ui (screens)',
          'version-control',
          '## packages/web',
          'remote-data [domains] (architecture: reads)',
          'ui [domains] (architecture: forms, with/remote-data)',
        ],
        warnings: [],
      },
    },
    {
      condition: 'a member follows only the base while the repository follows every axis',
      config: axesConfigOf('[architecture, workflow]'),
      files: axesMemberOf('[]'),
      view: {
        musts: [
          FOUR_DATA_STATES,
          ...belowFourDataStates,
          LABELS_ON_FIELDS,
          COMMITS_ARE_ATOMIC,
        ],
        index: [
          DOMAINS,
          'ui (screens; architecture: forms)',
          'version-control (workflow: commits)',
          '## packages/web',
          'leaves out',
          'remote-data [domains]',
        ],
        warnings: [],
      },
    },
    {
      condition: 'a member lists foundation in its axes',
      config: axesConfigOf('[]'),
      files: axesMemberOf('[foundation, workflow]'),
      view: {
        musts: [
          FOUR_DATA_STATES,
          ...belowFourDataStates,
          COMMITS_ARE_ATOMIC,
        ],
        index: [
          DOMAINS,
          'ui (screens)',
          'version-control',
          '## packages/web',
          'remote-data [domains]',
          'version-control [domains] (workflow: commits)',
        ],
        warnings: [
          [
            'config',
            'packages/web/constitution.yaml',
            'foundation',
          ],
        ],
      },
    },
  ])(
    'should give the files and MUST rules of the axes followed when $condition',
    ({ config, files, view }) => {
      // Arrange
      const project = createProject({
        config,
        files,
      });
      const session = newSession();

      // Act
      const context = contextOf(
        runHook({
          event: HookEvent.Compact,
          project,
          root,
          session,
        }),
      );

      // Assert
      expect({
        index: indexOf(context),
        musts: mustsOf(session),
        warnings: warningsOf({
          context,
          like: view.warnings,
        }),
      }).toStrictEqual<AxesView>(view);
    },
  );

  it.each<{
    condition: string;
    musts: readonly string[];
    overrides: string;
  }>([
    {
      condition: 'an override lowers a root rule',
      musts: [
        'four-data-states (SHOULD)',
        'loading-state-shown (SHOULD via four-data-states)',
        'skeleton-matches-content (SHOULD via four-data-states)',
        'error-state-offers-retry',
      ],
      overrides: fourDataStatesOverride('    level: SHOULD\n    reason: "Early screens"'),
    },
    {
      condition: 'an override lowers a rule in the middle of a chain',
      musts: [
        'four-data-states',
        'loading-state-shown (MAY)',
        'skeleton-matches-content (MAY via loading-state-shown)',
        'error-state-offers-retry',
      ],
      overrides: '\n  - rule: loading-state-shown\n    level: MAY\n    reason: "No spinner yet"',
    },
  ])(
    'should lower the rules below that state no level of their own when $condition',
    ({ musts, overrides }) => {
      // Arrange
      const project = createProject({
        config: configOf({
          domains: '[ui]',
          overrides,
        }),
      });
      const session = newSession();

      // Act
      runHook({
        event: HookEvent.Compact,
        project,
        root,
        session,
      });

      // Assert
      const shown: readonly string[] = mustsOf(session).filter((must) =>
        [
          'four-data-states',
          'loading-state-shown',
          'skeleton-matches-content',
          'error-state-offers-retry',
        ].includes(must.split(' ')[0] ?? ''),
      );

      expect(shown).toStrictEqual(musts);
    },
  );
});
