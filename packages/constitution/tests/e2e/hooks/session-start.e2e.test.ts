import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  browserAppContext,
  cliContext,
  coreOnlyContext,
  htmlSiteContext,
  libraryContext,
  packProjectContext,
  unparsedContext,
} from '../digests.fixtures';
import type { HookRun } from '../hook.fixtures';
import {
  blockListOf,
  bytesAfterHeader,
  contextOf,
  coreLinesOf,
  factsOf,
  HOOK_TODAY,
  HookEvent,
  lastLinesOf,
  mustsOf,
  newSession,
  outputOf,
  removeSessions,
  runHook,
  stateFolderOf,
  warningsOf,
} from '../hook.fixtures';
import {
  archiveOf,
  Breakage,
  coreBodyOfBytes,
  createPluginRoot,
  createRealPluginRoot,
  LINK,
  linkArchive,
  removePluginRoots,
} from '../plugin-root.fixtures';
import type { ProjectLayout } from '../project.fixtures';
import {
  BROWSER_APP,
  CLI,
  ConfigKey,
  configOf,
  createProject,
  HTML_SITE,
  LIBRARY,
  OWN_PACK,
  PACK_PROJECT,
  packBlockFiles,
  packPath,
  RATIFIED,
  REAL_CLI,
  REAL_WEB_APP,
  Repository,
  removeProjects,
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
  condition: string;
  config: string;
  line: number;
}

interface FactsCase {
  condition: string;
  event: HookEvent;
  facts: readonly string[];
  version: string;
}

interface WarningCase {
  condition: string;
  layout: ProjectLayout;
  warnings: readonly string[];
}

interface HeadingCase {
  event: HookEvent;
  heading: string;
}

interface DigestCase {
  context: (plugin: string) => string;
  layout: ProjectLayout;
  project: string;
}

interface EscapeCase {
  pin: string;
  shown: string;
  what: string;
}

interface ReadCase {
  condition: string;
  config: string;
  facts: readonly string[];
}

interface EdgeCase {
  condition: string;
  coreBody: number;
  domains: string;
  tail: readonly string[];
}

interface EventCase {
  event: HookEvent;
  name: string;
}

interface NoticeCase {
  // a field the archive's package.json is written without
  breakage?: Breakage | undefined;
  condition: string;
  // the project's link points to a folder that does not exist
  dangling?: boolean | undefined;
  // the archive's constitutionFormat, or undefined for the default archive's
  format?: number | string | undefined;
  notice: (archive: string) => readonly string[];
  // no archive is linked into the project
  unlinked?: boolean | undefined;
}

interface FailureCase {
  breakage?: Breakage;
  condition: string;
  layout: ProjectLayout;
  stderr: (paths: { archive: string; project: string }) => string;
}

interface AxesView {
  core: readonly string[];
  list: readonly string[];
  musts: readonly string[];
  warnings: readonly string[];
}

interface AxesCase {
  condition: string;
  config: string;
  view: AxesView;
}

interface BlockListCase {
  condition: string;
  layout: ProjectLayout;
  lines: readonly string[];
}

const WARNINGS = '⚠️ Warnings';
const BUDGET = 9400;
const FOUND = configOf({
  domains: '[version-control]',
  implementations: '[git]',
});
const fourDataStatesOverride = (fields: string): string =>
  `\n  - rule: four-data-states\n${fields}`;
// Ids of four bytes give warning lines of 50 bytes, newline included.
const unknownIds = (count: number): readonly string[] =>
  Array.from(
    {
      length: count,
    },
    (_, index) => `u${String(index + 1).padStart(3, '0')}`,
  );
const unknownWarning = (id: string): string => `- unknown: ${id} is not a block — check the name`;

const CORE_HEAD = "Core's chapters, blocks/core/<name>.md, and what each governs:";
const CORE_CODE = '- code: any code no other chapter governs.';
const KEY = "In brackets, a block's other files, named without .md; an axis alone is <axis>/<id>.";
const DOMAINS = '## Domains (blocks/domains/<id>/<id>.md)';
const AXIS_DOMAINS = '[ui, remote-data, version-control]';
const REMOTE_DATA = '- remote-data: Data another system owns.';
const UI = '- ui: Screens and what a user sees on them.';
const VERSION_CONTROL = '- version-control: History of the code.';
const READS_ARE_CANCELLABLE = 'reads-are-cancellable';
const FOUR_DATA_STATES = 'four-data-states';
const LABELS_ON_FIELDS = 'labels-on-fields';
const BELOW_FOUR_DATA_STATES = [
  'loading-state-shown',
  'skeleton-matches-content',
  'error-state-offers-retry',
];
const OPTIMISTIC_WRITES_ROLL_BACK = 'optimistic-writes-roll-back';
const COMMITS_ARE_ATOMIC = 'commits-are-atomic';
const EVERY_AXIS: AxesView = {
  core: [
    CORE_HEAD,
    CORE_CODE,
    '- principles',
    '- architecture/principles',
    '- workflow/delivery',
  ],
  musts: [
    READS_ARE_CANCELLABLE,
    FOUR_DATA_STATES,
    ...BELOW_FOUR_DATA_STATES,
    LABELS_ON_FIELDS,
    OPTIMISTIC_WRITES_ROLL_BACK,
    COMMITS_ARE_ATOMIC,
  ],
  list: [
    DOMAINS,
    KEY,
    `${REMOTE_DATA} (architecture)`,
    `${UI} (architecture/forms, architecture/with/remote-data)`,
    `${VERSION_CONTROL} (workflow)`,
  ],
  warnings: [],
};
const BASE_ONLY: AxesView = {
  core: [
    CORE_HEAD,
    CORE_CODE,
    '- principles',
  ],
  musts: [
    FOUR_DATA_STATES,
    ...BELOW_FOUR_DATA_STATES,
  ],
  list: [
    DOMAINS,
    KEY,
    REMOTE_DATA,
    `${UI}`,
    VERSION_CONTROL,
  ],
  warnings: [],
};
const axesConfigOf = (input: { axes: string; packages?: string }): string =>
  configOf({
    ...(input.packages === undefined
      ? {}
      : {
          packages: input.packages,
        }),
    axes: input.axes,
    domains: '[ui, version-control]',
  });

// Where the hook finds the archive the project pins.
const archiveIn = (project: string): string => join(project, LINK);

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
      layout: CLI,
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
        aboveConfig: FOUND,
      },
    },
    {
      condition:
        'no repository holds the start folder and constitution.yaml lies only in its parent',
      cwd: '',
      layout: {
        aboveConfig: FOUND,
        repository: Repository.None,
      },
    },
    {
      condition: 'CLAUDE_PROJECT_DIR names a folder that does not exist',
      cwd: '',
      layout: CLI,
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
    'should find the project and state its pin when $condition',
    ({ cwd, nonUtf8Byte, projectDir, repository, spawnOutside }) => {
      // Arrange
      const project = createProject({
        config: FOUND,
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
      const facts = factsOf(
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
      expect(facts).toStrictEqual([
        'constitution.yaml pins 1.0.0; 3 blocks are active.',
      ]);
    },
  );

  it.each<UnparsedCase>([
    {
      condition: 'a value is an anchor',
      config: configOf({
        version: '&pin 1.0.0',
      }),
      line: 1,
    },
    {
      condition: 'axes leaves architecture and workflow out and a later list item is an alias',
      config: configOf({
        axes: '[]',
        platforms: '[*browser]',
      }),
      line: 4,
    },
    {
      condition: 'a tab indents a line',
      config: configOf({
        domains: '\n\t- ui',
      }),
      line: 4,
    },
    {
      condition: 'a flow list never closes',
      config: 'version: 1.0.0\ndomains: [ui,\n  remote-data\n',
      line: 2,
    },
    {
      condition: 'a value is a block scalar',
      config: configOf({
        check: '|\n  bun run check',
      }),
      line: 8,
    },
    {
      condition: 'a second document follows',
      config: `${configOf({})}---\nversion: 1.0.0\n`,
      line: 10,
    },
    {
      condition: 'a key is repeated',
      config: `${configOf({})}domains: [ui]\n`,
      line: 10,
    },
    {
      condition: 'an override has a field outside the grammar',
      config: configOf({
        overrides: fourDataStatesOverride('    level: MAY\n    ticket: X-1'),
      }),
      line: 12,
    },
    {
      condition: 'a value carries a tag',
      config: configOf({
        version: '!!str 1.0.0',
      }),
      line: 1,
    },
    {
      condition: 'a flow list holds a flow mapping',
      config: configOf({
        domains: '[{a: b}]',
      }),
      line: 3,
    },
    {
      condition: 'a flow list nests another that runs on to the next line',
      config: 'version: 1.0.0\ndomains: [ui, [i18n,\n  remote-data]]\n',
      line: 2,
    },
    {
      condition: 'a flow list has an empty item between two',
      config: configOf({
        domains: '[ui,, i18n]',
      }),
      line: 3,
    },
    {
      condition: 'a flow list goes on at the start of a line',
      config: 'version: 1.0.0\ndomains: [ui,\nremote-data]\n',
      line: 3,
    },
    {
      condition: 'a key has no space after its colon',
      config: `${configOf({
        omit: ConfigKey.Check,
      })}check:bun run check\n`,
      line: 9,
    },
    {
      condition: 'an application path is repeated',
      config: configOf({
        packages: '\n  web:\n    domains: [ui]\n  web:\n    domains: [i18n]',
      }),
      line: 10,
    },
    {
      condition: "an application's key is repeated",
      config: configOf({
        packages: '\n  web:\n    domains: [ui]\n    domains: [i18n]',
      }),
      line: 10,
    },
    {
      condition: "an override's field is repeated",
      config: configOf({
        overrides: fourDataStatesOverride('    level: MAY\n    level: SHOULD'),
      }),
      line: 12,
    },
    {
      condition: "an override's field is indented past its item",
      config: configOf({
        overrides: fourDataStatesOverride('      level: MAY'),
      }),
      line: 11,
    },
    {
      condition: 'an application has a key outside the grammar',
      config: configOf({
        packages: '\n  web:\n    stack: [react]',
      }),
      line: 9,
    },
  ])('should name the line and give only core when $condition', ({ config, line }) => {
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
    expect(context).toBe(
      unparsedContext({
        line,
        root: archiveIn(project),
      }),
    );
  });

  it.each<ReadCase>([
    {
      condition: 'CRLF line ends',
      config: FOUND.replaceAll('\n', '\r\n'),
      facts: [
        'constitution.yaml pins 1.0.0; 3 blocks are active.',
      ],
    },
    {
      condition: 'a document marker on its first line',
      config: `---\n${FOUND}`,
      facts: [
        'constitution.yaml pins 1.0.0; 3 blocks are active.',
      ],
    },
    {
      condition: 'a "#" and a ":" in a double-quoted value',
      config: configOf({
        version: '"1.0 #7: x"',
      }),
      facts: [
        'constitution.yaml pins 1.0 #7: x; 1 block is active.',
      ],
    },
    {
      condition: 'a "#" with no blank before it',
      config: configOf({
        version: '1.0#7',
      }),
      facts: [
        'constitution.yaml pins 1.0#7; 1 block is active.',
      ],
    },
    {
      condition: 'escaped quotes and backslashes in a double-quoted value',
      config: configOf({
        version: '"1.0\\"7\\\\x"',
      }),
      facts: [
        'constitution.yaml pins 1.0"7\\x; 1 block is active.',
      ],
    },
    {
      condition: 'a doubled quote in a single-quoted value',
      config: configOf({
        version: "'1.0''7'",
      }),
      facts: [
        "constitution.yaml pins 1.0'7; 1 block is active.",
      ],
    },
    {
      condition: 'a flow list that ends with a comma',
      config: configOf({
        domains: '[version-control, ]',
        implementations: '[git,]',
      }),
      facts: [
        'constitution.yaml pins 1.0.0; 3 blocks are active.',
      ],
    },
    {
      condition: 'empty flow collections with blanks inside',
      config: configOf({
        packages: '{ }',
        domains: '[ ]',
        overrides: '[ ]',
      }),
      facts: [
        'constitution.yaml pins 1.0.0; 1 block is active.',
      ],
    },
    {
      condition: 'a block listed under the wrong key',
      config: configOf({
        implementations: '[ui]',
      }),
      facts: [
        'constitution.yaml pins 1.0.0; 2 blocks are active.',
      ],
    },
  ])('should read constitution.yaml when it holds $condition', ({ config, facts }) => {
    // Arrange
    const project = createProject({
      config,
    });

    // Act
    const printed = factsOf(
      contextOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root,
        }),
      ),
    );

    // Assert
    expect(printed).toStrictEqual(facts);
  });

  it('should take the nearest constitution.yaml when two lie on the way up', () => {
    // Arrange
    const project = createProject({
      config: FOUND,
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
    const facts = factsOf(
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
    expect(facts).toStrictEqual([
      'constitution.yaml pins 1.0.0; 2 blocks are active.',
    ]);
  });

  it('should read the files without a warning when they are written from the templates', () => {
    // Arrange
    const project = createProject(RATIFIED);

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
      facts: factsOf(context),
      pack: blockListOf(context).filter((line) => line.includes(`(${OWN_PACK})`)),
      warnings: warningsOf(context),
    }).toStrictEqual({
      facts: [
        'constitution.yaml pins 1.0.0; 7 blocks are active.',
      ],
      pack: [
        '- paraglide (constitution): Paraglide messages, compiled per locale.',
      ],
      warnings: [],
    });
  });

  it.each<FactsCase>([
    {
      condition: 'the pin differs at startup',
      event: HookEvent.Startup,
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
        'constitution.yaml pins 0.9.0 while .droneey/constitution holds 1.0.0; this digest follows 1.0.0.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin differs after clear',
      event: HookEvent.Clear,
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin differs in a sub-agent',
      event: HookEvent.Subagent,
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin equals the installed version at startup',
      event: HookEvent.Startup,
      facts: [
        'constitution.yaml pins 1.0.0; 3 blocks are active.',
      ],
      version: '1.0.0',
    },
    {
      condition: 'constitution.yaml pins no version at startup',
      event: HookEvent.Startup,
      facts: [
        'constitution.yaml pins no version; 3 blocks are active.',
      ],
      version: '',
    },
  ])('should state the header facts when $condition', ({ event, facts, version }) => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains: '[version-control]',
        implementations: '[git]',
        version,
      }),
    });

    // Act
    const printed = factsOf(
      contextOf(
        runHook({
          event,
          project,
          root,
        }),
      ),
    );

    // Assert
    expect(printed).toStrictEqual(facts);
  });

  it.each<HeadingCase>([
    {
      event: HookEvent.Startup,
      heading: `${WARNINGS} — tell the user at the start of the session`,
    },
    {
      event: HookEvent.Clear,
      heading: WARNINGS,
    },
  ])('should head the warnings with "$heading" when the event is $event', ({ event, heading }) => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains: '[tanstak-query]',
      }),
    });

    // Act
    const warnings = warningsOf(
      contextOf(
        runHook({
          project,
          event,
          root,
        }),
      ),
    );

    // Assert
    expect(warnings).toStrictEqual([
      heading,
      '- unknown: tanstak-query is not a block — check the name',
    ]);
  });

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
        WARNINGS,
        '- missing: _react needs ui — add ui to domains',
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
        WARNINGS,
        '- missing: tanstack-query needs _react — add react-dom to implementations',
      ],
    },
    {
      condition: "an application's block lacks a block it requires",
      layout: {
        config: configOf({
          packages:
            '\n  web:\n    domains: [untrusted-client, unreliable-network]\n    platforms: [browser]\n    implementations: [react-dom]',
        }),
      },
      warnings: [
        WARNINGS,
        '- missing: _react in web needs ui — add ui to domains',
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
        WARNINGS,
        '- wrong-key: core is always active — remove it from domains',
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
        WARNINGS,
        '- config: constitution.yaml leaves check empty — name the command that runs every check, or write check: null',
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
        WARNINGS,
        '- config: constitution.yaml leaves domains empty — write domains: []',
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
        WARNINGS,
        '- config: the override on line 10 has no reason — complete it or remove it',
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
        WARNINGS,
        '- config: the override of four-data-states sets the level MUST — write SHOULD or MAY',
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
        WARNINGS,
        '- unknown: ./rules/implementations/paraglide.md is a path — put the block in a pack listed under packs: and name it by its id',
      ],
    },
    {
      condition: 'a block of the pack requires a block of the pack active only in an application',
      layout: {
        config: configOf({
          packages: '\n  packages/x:\n    implementations: [beta]',
          implementations: '[alpha]',
          packs: `[${OWN_PACK}]`,
        }),
        files: {
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
        WARNINGS,
        '- missing: alpha needs beta — add beta to implementations',
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
        WARNINGS,
        '- unknown: folder is not a block — check the name',
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
        WARNINGS,
        '- unknown: pipe is not a block — check the name',
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
        WARNINGS,
        '- unknown: nope is not a block — check the name',
      ],
    },
    {
      condition: 'an application adds nothing the repository lacks for a missing block',
      layout: {
        config: configOf({
          packages: '\n  web:\n    domains: [i18n]',
          domains: '[untrusted-client, unreliable-network]',
          implementations: '[react-dom]',
          platforms: '[browser]',
        }),
      },
      warnings: [
        WARNINGS,
        '- missing: _react needs ui — add ui to domains',
      ],
    },
    {
      condition: 'every code applies',
      layout: {
        config: configOf({
          domains: '[analytics, version-control]',
          implementations: '[_react, tanstak-query, ui, matomo, git, react-dom]',
          languages: '[typescript]',
          omit: ConfigKey.Packages,
          overrides: fourDataStatesOverride(
            '    level: MAY\n    reason: "later"\n    until: 2020-01-01',
          ),
          packs: '[packs/gone]',
        }),
      },
      warnings: [
        WARNINGS,
        '- missing: react-dom needs browser — add browser to platforms',
        '- abstract: _react cannot be listed — list react-dom',
        '- unknown: tanstak-query is not a block — check the name',
        '- wrong-key: ui is a domain — move it from implementations to domains',
        '- config: constitution.yaml has no packages key — add packages: {}',
        '- pack: packs/gone is not installed — run mise install, or check the path',
        '- not-met: matomo does not meet analytics-consent-first — see its Requirements table',
        '- override: four-data-states expired on 2020-01-01 — renew or remove it',
      ],
    },
    {
      condition: 'a key holds a block the grammar does not know',
      layout: {
        config: `${configOf({})}skip:\n  - react-dom\n  - nested: [x]\n`,
      },
      warnings: [
        WARNINGS,
        '- config: constitution.yaml has the unknown key skip — remove it',
      ],
    },
    {
      condition: "an application's key holds nothing",
      layout: {
        config: configOf({
          packages: '\n  web:\n    domains:',
        }),
      },
      warnings: [
        WARNINGS,
        '- config: web leaves domains empty — write domains: []',
      ],
    },
    {
      condition: 'packages holds nothing',
      layout: {
        config: configOf({
          packages: '',
        }),
      },
      warnings: [
        WARNINGS,
        '- config: constitution.yaml leaves packages empty — write packages: {}',
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
        WARNINGS,
        '- config: the override of four-data-states has until soon — write a date as YYYY-MM-DD',
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
        WARNINGS,
        '- config: the override on line 10 has no rule, level — complete it or remove it',
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
        WARNINGS,
        '- wrong-key: kit is a domain — move it from implementations to domains',
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
        WARNINGS,
        `- pack: ${packPath({
          id: 'git',
        })} repeats the block git — the one read first is used`,
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
        WARNINGS,
        `- pack: ${packPath({
          id: 'kit',
        })} has no front matter — the block is read without its card`,
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
        WARNINGS,
        `- pack: ${packPath({
          id: 'kit',
        })} cannot be read — its rules are left out`,
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
            '---\nid: kit\nsummary: "Kit."\nrequires: [nothing-here]\nextends: ghost\nabstract: false\nlanguages: []\ndictionary: []\ngoverns: []\n---\n\n# Kit\n',
          [packPath({
            id: 'tool',
          })]:
            '---\nid: tool\nsummary: "Tool."\nrequires: []\nextends: git\nabstract: false\nlanguages: []\ndictionary: []\ngoverns: []\n---\n\n# Tool\n',
        },
      },
      warnings: [
        WARNINGS,
        '- missing: git needs version-control — add version-control to domains',
        '- pack: kit requires nothing-here, which is not a block — fix its front matter',
        '- pack: kit extends ghost, which is not a block — fix its front matter',
        '- pack: tool extends git, a concrete block; a block extends only an abstract base — require it instead',
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
      condition: "an application's override lowers the requirement its library does not meet",
      layout: {
        config: configOf({
          packages:
            '\n  web:\n    domains: [analytics]\n    implementations: [matomo]\n    overrides:\n      - rule: analytics-consent-first\n        level: SHOULD\n        reason: "no banner yet"',
        }),
      },
      warnings: [],
    },
    {
      condition: 'an application shares the library that misses a requirement',
      layout: {
        config: configOf({
          packages: '\n  web:\n    domains: [ui]',
          domains: '[analytics]',
          implementations: '[matomo]',
        }),
      },
      warnings: [
        WARNINGS,
        '- not-met: matomo does not meet analytics-consent-first — see its Requirements table',
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
        WARNINGS,
        '- override: four-states names no rule — check the slug',
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
        WARNINGS,
        '- not-met: matomo does not meet analytics-consent-first — see its Requirements table',
        '- override: analytics-consent-first expired on 2020-01-01 — renew or remove it',
      ],
    },
  ])('should warn as listed when $condition', ({ layout, warnings }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const printed = warningsOf(
      contextOf(
        runHook({
          project,
          event: HookEvent.Subagent,
          root,
        }),
      ),
    );

    // Assert
    expect(printed).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'the warnings fill 1,000 bytes exactly',
      domains: `[${unknownIds(20).join(', ')}]`,
      warnings: [
        WARNINGS,
        ...unknownIds(20).map(unknownWarning),
      ],
    },
    {
      condition: 'the warnings pass 1,000 bytes by one byte',
      domains: `[${unknownIds(19).join(', ')}, u0020]`,
      warnings: [
        WARNINGS,
        ...unknownIds(19).map(unknownWarning),
        'and 1 more',
      ],
    },
  ])('should print warnings up to 1,000 bytes when $condition', ({ domains, warnings }) => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains,
      }),
    });

    // Act
    const printed = warningsOf(
      contextOf(
        runHook({
          project,
          event: HookEvent.Subagent,
          root,
        }),
      ),
    );

    // Assert
    expect(printed).toStrictEqual(warnings);
  });

  it.each<DigestCase>([
    {
      context: browserAppContext,
      layout: BROWSER_APP,
      project: 'a browser application with a block of its own pack and an override',
    },
    {
      context: cliContext,
      layout: CLI,
      project: 'a command-line program',
    },
    {
      context: libraryContext,
      layout: LIBRARY,
      project: 'a library whose package is an application with its override',
    },
    {
      context: packProjectContext,
      layout: PACK_PROJECT,
      project: 'one with a pack of its own, one of its blocks in an application',
    },
    {
      context: htmlSiteContext,
      layout: HTML_SITE,
      project: 'a plain HTML site in no language',
    },
  ])(
    'should give the digest in index order when the project is $project',
    ({ context, layout }) => {
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
    },
  );

  it.each([
    {
      layout: REAL_WEB_APP,
      shape: 'the reference web application',
    },
    {
      layout: REAL_CLI,
      shape: 'the reference command-line tool',
    },
  ])(
    'should keep the digest within 9,400 bytes and without a warning when $shape follows the real blocks',
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
        warnings: warningsOf(context),
      }).toStrictEqual({
        isWithinBudget: true,
        warnings: [],
      });
    },
  );

  it('should list every active block when the reference web application follows the real blocks', () => {
    // Arrange
    const project = createProject(REAL_WEB_APP);

    // Act
    const context = contextOf(
      runHook({
        project,
        event: HookEvent.Subagent,
        root: createRealPluginRoot(),
      }),
    );

    // Assert
    expect(context).not.toContain('did not fit');
  });

  it.each<EscapeCase>([
    {
      pin: '1.0\\0',
      shown: '1.0\\0',
      what: 'a backslash',
    },
    {
      pin: '1.0"0',
      shown: '1.0"0',
      what: 'a quote',
    },
    {
      pin: '1.0\t0',
      shown: '1.0\t0',
      what: 'a tab',
    },
    {
      pin: '1.0\u001f0',
      shown: '1.0\u001f0',
      what: 'the control byte 0x1f',
    },
    {
      pin: '1.0\r0',
      shown: '1.00',
      what: 'a carriage return, which the context drops',
    },
    {
      pin: '1.0-naïve-крок',
      shown: '1.0-naïve-крок',
      what: 'non-ASCII text',
    },
  ])(
    'should print one valid JSON object that keeps the pin when it holds $what',
    ({ pin, shown }) => {
      // Arrange
      const project = createProject({
        config: configOf({
          version: pin,
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
      expect(output).toStrictEqual({
        context: coreOnlyContext({
          pin: shown,
          root: archiveIn(project),
        }),
        event: 'SubagentStart',
      });
    },
  );

  it('should escape DEL as \\u007f when the pin holds it', () => {
    // Arrange
    const project = createProject({
      config: configOf({
        version: '1.0\u007f0',
      }),
    });

    // Act
    const run = runHook({
      event: HookEvent.Subagent,
      project,
      root,
    });

    // Assert
    expect(run.stdout).toContain('pins 1.0\\u007f0;');
  });

  it('should mark a rule with every override of it, in the order of the file, when a project overrides rules', () => {
    // Arrange
    const project = createProject({
      config: configOf({
        packages:
          '\n  web:\n    overrides:\n      - rule: four-data-states\n        level: SHOULD\n        reason: "the kit decides"',
        domains: '[ui]',
        overrides: fourDataStatesOverride('    level: MAY\n    reason: "a prototype"'),
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
    expect(mustsOf(session)).toContain('four-data-states (SHOULD in web; MAY)');
  });

  // Core's text sets how much room is left: the lines naming core's chapters
  // take 165 bytes, the gap and heading of the block list 42, the line under that
  // heading 85 and a synthetic domain's line 88.
  it.each<EdgeCase>([
    {
      condition: 'the last line of the block list ends on the budget, reserve kept',
      coreBody: 8820,
      domains: '[synthetic-001]',
      tail: [
        '- synthetic-001: Block synthetic-001 pads the digest to prove its byte budget holds up.',
      ],
    },
    {
      condition: 'the last line of the block list passes the budget by one byte',
      coreBody: 8821,
      domains: '[synthetic-001]',
      tail: [
        KEY,
        '1 more line of the block list did not fit; constitution.yaml names every block.',
      ],
    },
    {
      condition: 'the heading of the block list ends on the budget',
      coreBody: 8993,
      domains: '[synthetic-001]',
      tail: [
        '## Domains (blocks/domains/<id>/<id>.md)',
        '2 more lines of the block list did not fit; constitution.yaml names every block.',
      ],
    },
    {
      condition: 'the heading of the block list passes the budget by one byte',
      coreBody: 8994,
      domains: '[synthetic-001]',
      tail: [
        '',
        '3 more lines of the block list did not fit; constitution.yaml names every block.',
      ],
    },
  ])('should cut where the budget ends when $condition', ({ coreBody, domains, tail }) => {
    // Arrange
    const plugin = createPluginRoot({
      coreBody: coreBodyOfBytes(coreBody),
    });
    const project = createProject({
      config: configOf({
        domains,
      }),
    });

    // Act
    const context = contextOf(
      runHook({
        event: HookEvent.Startup,
        project,
        root: plugin,
      }),
    );

    // Assert
    expect(
      lastLinesOf({
        context,
        count: tail.length,
      }),
    ).toStrictEqual(tail);
  });

  it('should fill the budget to its last byte when the last line of the block list ends on it', () => {
    // Arrange
    const plugin = createPluginRoot({
      coreBody: coreBodyOfBytes(8820),
    });
    const project = createProject({
      config: configOf({
        domains: '[synthetic-001]',
      }),
    });

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
    expect(bytes).toBe(BUDGET - 200);
  });

  it.each<EventCase>([
    {
      event: HookEvent.Startup,
      name: 'SessionStart',
    },
  ])('should name the event $name when the hook runs at $event', ({ event, name }) => {
    // Arrange
    const project = createProject(CLI);

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

  it.each<NoticeCase>([
    {
      condition: 'the project holds no archive',
      notice: (archive): readonly string[] => [
        `The Droneey Constitution is not installed in this repository: ${archive} does not exist, so no rules are given.`,
        'Tell the user to run mise install, which installs the release mise.toml pins as github:droneey/constitution and links it there.',
      ],
      unlinked: true,
    },
    {
      condition: "the project's archive link points nowhere",
      dangling: true,
      notice: (archive): readonly string[] => [
        `The Droneey Constitution is not installed in this repository: ${archive} does not exist, so no rules are given.`,
        'Tell the user to run mise install, which installs the release mise.toml pins as github:droneey/constitution and links it there.',
      ],
    },
    ...[
      {
        breakage: Breakage.Format,
        condition:
          'the archive is a release from before block format 2, whose package.json names none',
      },
      {
        condition: 'the block format is older than the oldest the plugin reads',
        format: 1,
      },
      {
        condition: 'the block format is written as text',
        format: '2',
      },
    ].map((older: Omit<NoticeCase, 'notice'>) => ({
      ...older,
      notice: (archive: string): readonly string[] => [
        `The Droneey Constitution in ${archive} is older than block format 2, the oldest this plugin reads, so no rules are given.`,
        'Tell the user to raise the Constitution pin in this project, in mise.toml and constitution.yaml, and run mise install.',
      ],
    })),
    {
      condition: 'the block format is newer than the plugin reads',
      format: 3,
      notice: (archive): readonly string[] => [
        `The Droneey Constitution in ${archive} has block format 3, newer than this plugin reads, so no rules are given.`,
        'Tell the user to update the Constitution plugin: claude plugin marketplace update droneey, then claude plugin update constitution@droneey.',
      ],
    },
  ])(
    'should give only the reason and save no state when $condition',
    ({ breakage, dangling, format, notice, unlinked }) => {
      // Arrange
      const plugin =
        breakage === undefined && format === undefined
          ? root
          : createPluginRoot({
              ...(breakage === undefined
                ? {}
                : {
                    breakage,
                  }),
              ...(format === undefined
                ? {}
                : {
                    format,
                  }),
            });
      const project = createProject(CLI);
      const session = newSession();

      if (dangling === true) {
        linkArchive({
          archive: join(project, 'gone'),
          project,
        });
      }

      // Act
      const run = runHook({
        event: HookEvent.Startup,
        project,
        root: plugin,
        session,
        unlinked,
      });

      // Assert
      expect({
        context: contextOf(run),
        exitCode: run.exitCode,
        saved: existsSync(stateFolderOf(session)),
        stderr: run.stderr,
      }).toStrictEqual({
        context: `${notice(archiveIn(project)).join('\n')}\n`,
        exitCode: 0,
        saved: false,
        stderr: '',
      });
    },
  );

  it('should give the digest when the block format is the newest the plugin reads', () => {
    // Arrange
    const plugin = createPluginRoot({
      format: 2,
    });
    const project = createProject(CLI);

    // Act
    const facts = factsOf(
      contextOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root: plugin,
        }),
      ),
    );

    // Assert
    expect(facts).toStrictEqual([
      'constitution.yaml pins 1.0.0; 9 blocks are active.',
    ]);
  });

  it.each<FailureCase>([
    {
      breakage: Breakage.Manifest,
      condition: 'the archive lacks package.json',
      layout: CLI,
      stderr: ({ archive }): string => `constitution hook: cannot read ${archive}/package.json\n`,
    },
    {
      breakage: Breakage.Core,
      condition: "the archive lacks core's card",
      layout: CLI,
      stderr: (): string => 'constitution hook: cannot build the digest\n',
    },
    {
      breakage: Breakage.Version,
      condition: "the archive's package.json has no version",
      layout: CLI,
      stderr: ({ archive }): string =>
        `constitution hook: ${archive}/package.json has no version\n`,
    },
    {
      breakage: Breakage.Resolve,
      condition: 'an awk program in the middle of the pipeline fails',
      layout: CLI,
      stderr: (): string => 'constitution hook: cannot build the digest\n',
    },
    {
      condition: 'constitution.yaml cannot be read',
      layout: {
        ...CLI,
        unreadable: [
          'constitution.yaml',
        ],
      },
      stderr: ({ project }): string =>
        `constitution hook: cannot read ${project}/constitution.yaml\n`,
    },
  ])(
    'should write one line to stderr and exit 1 when $condition',
    ({ breakage, layout, stderr }) => {
      // Arrange
      const plugin = createPluginRoot(
        breakage === undefined
          ? {}
          : {
              breakage,
            },
      );
      const project = createProject(layout);

      // Act
      const run = runHook({
        event: HookEvent.Startup,
        project,
        root: plugin,
      });

      // Assert
      expect(run).toStrictEqual<HookRun>({
        exitCode: 1,
        stderr: stderr({
          archive: archiveIn(project),
          project,
        }),
        stdout: '',
      });
    },
  );

  it.each<BlockListCase>([
    {
      condition: "a top-level block's with/ file is active only in an application",
      layout: {
        config: configOf({
          packages: '\n  packages/web:\n    domains: [remote-data]',
          domains: '[ui]',
        }),
      },
      lines: [
        '## Domains (blocks/domains/<id>/<id>.md)',
        KEY,
        '- ui: Screens and what a user sees on them. (architecture/forms)',
        '## packages/web',
        '- remote-data (domains): Data another system owns. (architecture)',
        '- ui (domains): Also: architecture/with/remote-data',
      ],
    },
  ])('should list the active blocks as given when $condition', ({ layout, lines }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const list = blockListOf(
      contextOf(
        runHook({
          event: HookEvent.Subagent,
          project,
          root,
        }),
      ),
    );

    // Assert
    expect(list).toStrictEqual(lines);
  });

  it.each<AxesCase>([
    {
      condition: 'the repository follows all three axes',
      config: configOf({
        domains: AXIS_DOMAINS,
      }),
      view: EVERY_AXIS,
    },
    {
      condition: 'the repository follows only the base',
      config: configOf({
        axes: '[]',
        domains: AXIS_DOMAINS,
      }),
      view: BASE_ONLY,
    },
    {
      condition: 'constitution.yaml has no axes key',
      config: configOf({
        domains: AXIS_DOMAINS,
        omit: ConfigKey.Axes,
      }),
      view: {
        ...EVERY_AXIS,
        warnings: [
          WARNINGS,
          '- config: constitution.yaml has no axes key — add axes: [architecture, workflow]',
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
        ...BASE_ONLY,
        warnings: [
          WARNINGS,
          '- config: axes names design — write architecture or workflow',
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
        core: [
          CORE_HEAD,
          CORE_CODE,
          '- principles',
          '- architecture/principles',
        ],
        musts: [
          READS_ARE_CANCELLABLE,
          FOUR_DATA_STATES,
          ...BELOW_FOUR_DATA_STATES,
          LABELS_ON_FIELDS,
          OPTIMISTIC_WRITES_ROLL_BACK,
        ],
        list: [
          DOMAINS,
          KEY,
          `${REMOTE_DATA} (architecture)`,
          `${UI} (architecture/forms, architecture/with/remote-data)`,
          VERSION_CONTROL,
        ],
        warnings: [
          WARNINGS,
          "- config: constitution.yaml lists foundation in axes — a block's root is always followed, remove it",
        ],
      },
    },
    {
      condition:
        'an application follows an axis the repository leaves out, for its own block and a top-level one',
      config: axesConfigOf({
        packages: '\n  packages/web:\n    axes: [architecture]\n    domains: [remote-data]',
        axes: '[]',
      }),
      view: {
        core: BASE_ONLY.core,
        musts: [
          READS_ARE_CANCELLABLE,
          FOUR_DATA_STATES,
          ...BELOW_FOUR_DATA_STATES,
          LABELS_ON_FIELDS,
          OPTIMISTIC_WRITES_ROLL_BACK,
        ],
        list: [
          DOMAINS,
          KEY,
          `${UI}`,
          VERSION_CONTROL,
          '## packages/web',
          '- remote-data (domains): Data another system owns. (architecture)',
          '- ui (domains): Also: architecture/forms, architecture/with/remote-data',
        ],
        warnings: [],
      },
    },
    {
      condition: 'an application follows only the base while the repository follows every axis',
      config: axesConfigOf({
        packages: '\n  packages/web:\n    axes: []\n    domains: [remote-data]',
        axes: '[architecture, workflow]',
      }),
      view: {
        core: EVERY_AXIS.core,
        musts: [
          FOUR_DATA_STATES,
          ...BELOW_FOUR_DATA_STATES,
          LABELS_ON_FIELDS,
          COMMITS_ARE_ATOMIC,
        ],
        list: [
          DOMAINS,
          KEY,
          `${UI} (architecture/forms)`,
          `${VERSION_CONTROL} (workflow)`,
          '## packages/web',
          '- remote-data (domains): Data another system owns.',
        ],
        warnings: [],
      },
    },
    {
      condition: 'an application lists foundation in its axes',
      config: axesConfigOf({
        packages: '\n  packages/web:\n    axes: [foundation, workflow]\n    domains: [remote-data]',
        axes: '[]',
      }),
      view: {
        core: BASE_ONLY.core,
        musts: [
          FOUR_DATA_STATES,
          ...BELOW_FOUR_DATA_STATES,
          COMMITS_ARE_ATOMIC,
        ],
        list: [
          DOMAINS,
          KEY,
          `${UI}`,
          VERSION_CONTROL,
          '## packages/web',
          '- remote-data (domains): Data another system owns.',
          '- version-control (domains): Also: workflow',
        ],
        warnings: [
          WARNINGS,
          "- config: packages/web lists foundation in axes — a block's root is always followed, remove it",
        ],
      },
    },
  ])(
    'should give the files and MUST rules of the axes followed when $condition',
    ({ config, view }) => {
      // Arrange
      const project = createProject({
        config,
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
        core: coreLinesOf(context),
        list: blockListOf(context),
        musts: mustsOf(session),
        warnings: warningsOf(context),
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

      const shown: readonly string[] = mustsOf(session).filter((must) =>
        [
          'four-data-states',
          'loading-state-shown',
          'skeleton-matches-content',
          'error-state-offers-retry',
        ].includes(must.split(' ')[0] ?? ''),
      );

      // Assert
      expect(shown).toStrictEqual(musts);
    },
  );
});
