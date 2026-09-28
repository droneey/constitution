import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  browserAppContext,
  cliContext,
  coreOnlyContext,
  htmlSiteContext,
  libraryContext,
  localBlocksContext,
  unparsedContext,
} from './digests.fixtures';
import type { HookEvent, HookRun } from './hook.fixtures';
import {
  blockListOf,
  bytesAfterHeader,
  contextOf,
  factsOf,
  HOOK_TODAY,
  headlineOf,
  lastLinesOf,
  outputOf,
  runHook,
  warningsOf,
} from './hook.fixtures';
import type { Breakage } from './plugin-root.fixtures';
import {
  corePartOfBytes,
  createPluginRoot,
  removePluginRoots,
} from './plugin-root.fixtures';
import type { ProjectLayout } from './project.fixtures';
import {
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
  REAL_CLI,
  REAL_WEB_APP,
  removeProjects,
  syntheticProject,
} from './project.fixtures';

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
  repository: 'folder' | 'worktree' | 'none';
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

interface TailCase {
  blocks: number;
  tail: readonly string[];
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
  corePart: number;
  domains: string;
  tail: readonly string[];
}

interface EventCase {
  event: HookEvent;
  name: string;
}

interface FailureCase {
  breakage?: Breakage;
  condition: string;
  layout: ProjectLayout;
  stderr: (paths: { plugin: string; project: string }) => string;
}

interface BlockListCase {
  condition: string;
  layout: ProjectLayout;
  lines: readonly string[];
}

const WARNINGS = '⚠️ Warnings';
const LEFT_OUT_ONE =
  'The MUST headlines of 1 block were left out; the block files hold them.';
const BUDGET = 9400;
// The real blocks and digests of this repository, read and never written.
const REPOSITORY = join(import.meta.dir, '..', '..');
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
const unknownWarning = (id: string): string =>
  `- unknown: ${id} is not a block — check the name`;

let root = '';

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();
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
        repository: 'none',
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
        event: 'startup',
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
      condition:
        'CLAUDE_PROJECT_DIR names the project root and cwd lies outside it',
      cwd: '..',
      projectDir: '',
      repository: 'folder',
    },
    {
      condition: 'CLAUDE_PROJECT_DIR names a subfolder of the repository',
      cwd: '..',
      projectDir: 'packages/app',
      repository: 'folder',
    },
    {
      condition: 'CLAUDE_PROJECT_DIR is unset and cwd is a subfolder',
      cwd: 'src/deep',
      repository: 'folder',
    },
    {
      condition: 'cwd is a subfolder of a worktree, whose .git is a file',
      cwd: 'src/deep',
      repository: 'worktree',
    },
    {
      condition:
        'no repository holds the start folder and constitution.yaml lies in it',
      cwd: '',
      repository: 'none',
    },
    {
      condition:
        'CLAUDE_PROJECT_DIR is a symbolic link to a subfolder of the repository',
      cwd: '..',
      projectDir: '../link',
      repository: 'folder',
    },
    {
      condition: 'the process starts outside the cwd the event names',
      cwd: 'src/deep',
      repository: 'folder',
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding a quote',
      cwd: 'q"b',
      repository: 'folder',
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding a backslash',
      cwd: 'b\\s',
      repository: 'folder',
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding a control byte',
      cwd: 'c\u0001x',
      repository: 'folder',
      spawnOutside: true,
    },
    {
      condition: 'the event names a cwd holding non-ASCII text',
      cwd: 'crème',
      repository: 'folder',
      spawnOutside: true,
    },
    {
      condition:
        'the event holds a byte that is not UTF-8 and the locale is UTF-8',
      cwd: '',
      nonUtf8Byte: true,
      repository: 'folder',
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
            event: 'subagent',
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
      condition: 'a list item is an alias',
      config: configOf({
        platforms: '[*browser]',
      }),
      line: 3,
    },
    {
      condition: 'a tab indents a line',
      config: configOf({
        domains: '\n\t- ui',
      }),
      line: 3,
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
      line: 7,
    },
    {
      condition: 'a second document follows',
      config: `${configOf({})}---\nversion: 1.0.0\n`,
      line: 9,
    },
    {
      condition: 'a key is repeated',
      config: `${configOf({})}domains: [ui]\n`,
      line: 9,
    },
    {
      condition: 'an override has a field outside the grammar',
      config: configOf({
        overrides: fourDataStatesOverride('    level: MAY\n    ticket: X-1'),
      }),
      line: 11,
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
      line: 2,
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
      line: 2,
    },
    {
      condition: 'a flow list goes on at the start of a line',
      config: 'version: 1.0.0\ndomains: [ui,\nremote-data]\n',
      line: 3,
    },
    {
      condition: 'a key has no space after its colon',
      config: `${configOf({
        omit: 'check',
      })}check:bun run check\n`,
      line: 8,
    },
    {
      condition: 'an application path is repeated',
      config: configOf({
        apps: '\n  web:\n    domains: [ui]\n  web:\n    domains: [i18n]',
      }),
      line: 9,
    },
    {
      condition: "an application's key is repeated",
      config: configOf({
        apps: '\n  web:\n    domains: [ui]\n    domains: [i18n]',
      }),
      line: 9,
    },
    {
      condition: "an override's field is repeated",
      config: configOf({
        overrides: fourDataStatesOverride('    level: MAY\n    level: SHOULD'),
      }),
      line: 11,
    },
    {
      condition: "an override's field is indented past its item",
      config: configOf({
        overrides: fourDataStatesOverride('      level: MAY'),
      }),
      line: 10,
    },
    {
      condition: 'an application has a key outside the grammar',
      config: configOf({
        apps: '\n  web:\n    stack: [react]',
      }),
      line: 8,
    },
  ])(
    'should name the line and give only core when $condition',
    ({ config, line }) => {
      // Arrange
      const project = createProject({
        config,
      });

      // Act
      const context = contextOf(
        runHook({
          project,
          event: 'startup',
          root,
        }),
      );

      // Assert
      expect(context).toBe(
        unparsedContext({
          line,
          root,
        }),
      );
    },
  );

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
        apps: '{ }',
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
  ])(
    'should read constitution.yaml when it holds $condition',
    ({ config, facts }) => {
      // Arrange
      const project = createProject({
        config,
      });

      // Act
      const printed = factsOf(
        contextOf(
          runHook({
            event: 'subagent',
            project,
            root,
          }),
        ),
      );

      // Assert
      expect(printed).toStrictEqual(facts);
    },
  );

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

    // Act
    const facts = factsOf(
      contextOf(
        runHook({
          cwd: 'sub/deep',
          event: 'subagent',
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
        event: 'startup',
        project,
        root,
      }),
    );

    // Assert
    expect({
      facts: factsOf(context),
      local: blockListOf(context).filter((line) => line.includes('(local')),
      warnings: warningsOf(context),
    }).toStrictEqual({
      facts: [
        'constitution.yaml pins 1.0.0; 7 blocks are active.',
      ],
      local: [
        '- paraglide (local, draft, ./rules/implementations/paraglide.md): Paraglide messages, compiled per locale.',
      ],
      warnings: [],
    });
  });

  it.each<FactsCase>([
    {
      condition: 'the pin differs at startup',
      event: 'startup',
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
        'constitution.yaml pins 0.9.0 while the installed plugin is 1.0.0; this digest follows 1.0.0.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin differs after clear',
      event: 'clear',
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin differs after compact',
      event: 'compact',
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin differs in a sub-agent',
      event: 'subagent',
      facts: [
        'constitution.yaml pins 0.9.0; 3 blocks are active.',
      ],
      version: '0.9.0',
    },
    {
      condition: 'the pin equals the installed version at startup',
      event: 'startup',
      facts: [
        'constitution.yaml pins 1.0.0; 3 blocks are active.',
      ],
      version: '1.0.0',
    },
    {
      condition: 'constitution.yaml pins no version at startup',
      event: 'startup',
      facts: [
        'constitution.yaml pins no version; 3 blocks are active.',
      ],
      version: '',
    },
  ])(
    'should state the header facts when $condition',
    ({ event, facts, version }) => {
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
    },
  );

  it.each<HeadingCase>([
    {
      event: 'startup',
      heading: `${WARNINGS} — tell the user at the start of the session`,
    },
    {
      event: 'clear',
      heading: WARNINGS,
    },
    {
      event: 'compact',
      heading: WARNINGS,
    },
    {
      event: 'subagent',
      heading: WARNINGS,
    },
  ])(
    'should head the warnings with "$heading" when the event is $event',
    ({ event, heading }) => {
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
          apps: '\n  web:\n    domains: [untrusted-client, unreliable-network]\n    platforms: [browser]\n    implementations: [react-dom]',
        }),
      },
      warnings: [
        WARNINGS,
        '- missing: _react in web needs ui — add ui to domains',
      ],
    },
    {
      condition: 'an abstract block is listed',
      layout: {
        config: configOf({
          domains: '[ui]',
          implementations: '[_react]',
        }),
      },
      warnings: [
        WARNINGS,
        '- abstract: _react cannot be listed — list react-dom',
      ],
    },
    {
      condition: 'an id names no block',
      layout: {
        config: configOf({
          implementations: '[tanstak-query]',
        }),
      },
      warnings: [
        WARNINGS,
        '- unknown: tanstak-query is not a block — check the name',
      ],
    },
    {
      condition: "a block sits under another layer's key",
      layout: {
        config: configOf({
          implementations: '[ui]',
        }),
      },
      warnings: [
        WARNINGS,
        '- wrong-key: ui is a domain — move it from implementations to domains',
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
      condition: 'a key is missing',
      layout: {
        config: configOf({
          omit: 'apps',
        }),
      },
      warnings: [
        WARNINGS,
        '- config: constitution.yaml has no apps key — add apps: {}',
      ],
    },
    {
      condition: 'a key is unknown',
      layout: {
        config: `${configOf({})}skip: [react-dom]\n`,
      },
      warnings: [
        WARNINGS,
        '- config: constitution.yaml has the unknown key skip — remove it',
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
        '- config: constitution.yaml leaves check empty — name the command that runs every check',
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
        '- config: the override on line 9 has no reason — complete it or remove it',
      ],
    },
    {
      condition: 'an override sets a level that lowers nothing',
      layout: {
        config: configOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride(
            '    level: MUST\n    reason: "kept"',
          ),
        }),
      },
      warnings: [
        WARNINGS,
        '- config: the override of four-data-states sets the level MUST — write SHOULD or MAY',
      ],
    },
    {
      condition: 'a local block has no kind',
      layout: {
        config: configOf({
          domains: '[i18n]',
          implementations: `[${PARAGLIDE}]`,
        }),
        files: paraglideFiles({
          omit: 'kind',
          requires: '[i18n]',
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${PARAGLIDE} has no kind — fix its front matter`,
      ],
    },
    {
      condition: 'a local block does not exist',
      layout: {
        config: configOf({
          implementations: `[${PARAGLIDE}]`,
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${PARAGLIDE} does not exist — create it or remove it from implementations`,
      ],
    },
    {
      condition: 'a local block lies outside the repository',
      layout: {
        config: configOf({
          implementations: '[../shared/paraglide.md]',
        }),
      },
      warnings: [
        WARNINGS,
        '- local-block: ../shared/paraglide.md is not inside the repository — name a file under ./rules/',
      ],
    },
    {
      condition:
        'a local block requires a local block active only in an application',
      layout: {
        config: configOf({
          apps: `\n  packages/x:\n    implementations: [${localPath('beta')}]`,
          implementations: `[${localPath('alpha')}]`,
        }),
        files: {
          ...localBlockFiles({
            fields: {
              requires: '[beta]',
            },
            id: 'alpha',
          }),
          ...localBlockFiles({
            id: 'beta',
          }),
        },
      },
      warnings: [
        WARNINGS,
        `- missing: alpha needs beta — add ${localPath('beta')} to implementations`,
      ],
    },
    {
      condition:
        'a local tool reaches its language through another local block, listed after it',
      layout: {
        config: configOf({
          domains:
            '[ui, untrusted-client, unreliable-network, version-control]',
          implementations: `[react-dom, git, betterleaks, ${localPath('lint-tool')}, ${localPath('ts-base')}]`,
          languages: '[typescript]',
          platforms: '[browser]',
        }),
        files: {
          ...localBlockFiles({
            fields: {
              checks: '[lint]',
              requires: '[ts-base]',
            },
            id: 'lint-tool',
          }),
          ...localBlockFiles({
            fields: {
              requires: '[typescript]',
            },
            id: 'ts-base',
          }),
        },
      },
      warnings: [],
    },
    {
      condition: 'a local block path names a folder',
      layout: {
        config: configOf({
          implementations: `[${localPath('folder')}]`,
        }),
        files: {
          'rules/implementations/folder.md/.keep': '',
        },
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('folder')} is not a file — name the block's .md file`,
      ],
    },
    {
      condition: 'a local block path names a named pipe',
      layout: {
        config: configOf({
          implementations: `[${localPath('pipe')}]`,
        }),
        namedPipes: [
          'rules/implementations/pipe.md',
        ],
        files: {
          'rules/implementations/.keep': '',
        },
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('pipe')} is not a file — name the block's .md file`,
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
      condition:
        'an application adds nothing the repository lacks for a missing block',
      layout: {
        config: configOf({
          apps: '\n  web:\n    domains: [i18n]',
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
          implementations: `[_react, tanstak-query, ui, ${PARAGLIDE}, matomo, git, react-dom]`,
          languages: '[typescript]',
          omit: 'apps',
          overrides: fourDataStatesOverride(
            '    level: MAY\n    reason: "later"\n    until: 2020-01-01',
          ),
        }),
      },
      warnings: [
        WARNINGS,
        '- missing: react-dom needs browser — add browser to platforms',
        '- abstract: _react cannot be listed — list react-dom',
        '- unknown: tanstak-query is not a block — check the name',
        '- wrong-key: ui is a domain — move it from implementations to domains',
        '- config: constitution.yaml has no apps key — add apps: {}',
        `- local-block: ${PARAGLIDE} does not exist — create it or remove it from implementations`,
        '- no-tool: rules checked by lint have no tool for typescript — add one, such as biome, or override them',
        '- no-tool: rules checked by secrets have no tool for typescript — add one, such as betterleaks, or override them',
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
          apps: '\n  web:\n    domains:',
        }),
      },
      warnings: [
        WARNINGS,
        '- config: web leaves domains empty — write domains: []',
      ],
    },
    {
      condition: 'apps holds nothing',
      layout: {
        config: configOf({
          apps: '',
        }),
      },
      warnings: [
        WARNINGS,
        '- config: constitution.yaml leaves apps empty — write apps: {}',
      ],
    },
    {
      condition: "an override's until is no date",
      layout: {
        config: configOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride(
            '    level: MAY\n    reason: "later"\n    until: soon',
          ),
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
        '- config: the override on line 9 has no rule, level — complete it or remove it',
      ],
    },
    {
      condition: "a local block's kind belongs to another key",
      layout: {
        config: configOf({
          implementations: `[${localPath('kit')}]`,
        }),
        files: localBlockFiles({
          fields: {
            kind: 'domain',
          },
          id: 'kit',
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('kit')} has kind domain — make it implementation or move the block out of implementations`,
      ],
    },
    {
      condition: "a local block's id is not its file's name",
      layout: {
        config: configOf({
          implementations: `[${localPath('kit')}]`,
        }),
        files: localBlockFiles({
          fields: {
            id: 'toolkit',
          },
          id: 'kit',
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('kit')} has id toolkit — make it kit, the file's name`,
      ],
    },
    {
      condition: 'a local block takes the id of a constitution block',
      layout: {
        config: configOf({
          implementations: `[${localPath('git')}]`,
        }),
        files: localBlockFiles({
          id: 'git',
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('git')} repeats the constitution id git — rename it`,
      ],
    },
    {
      condition: 'a local block extends no constitution block',
      layout: {
        config: configOf({
          implementations: `[${localPath('kit')}]`,
        }),
        files: localBlockFiles({
          fields: {
            extends: 'nothing',
          },
          id: 'kit',
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('kit')} extends nothing, which is not a constitution block — fix its front matter`,
      ],
    },
    {
      condition: 'a local block requires no block',
      layout: {
        config: configOf({
          implementations: `[${localPath('kit')}]`,
        }),
        files: localBlockFiles({
          fields: {
            requires: '[nothing]',
          },
          id: 'kit',
        }),
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('kit')} requires nothing, which is not a block — fix its front matter`,
      ],
    },
    {
      condition: 'a local block path names no .md file',
      layout: {
        config: configOf({
          implementations: '[./rules/implementations/kit.txt]',
        }),
      },
      warnings: [
        WARNINGS,
        "- local-block: ./rules/implementations/kit.txt is not a block file — name the block's .md file",
      ],
    },
    {
      condition: 'a local block path is absolute',
      layout: {
        config: configOf({
          implementations: '[/rules/kit.md]',
        }),
      },
      warnings: [
        WARNINGS,
        '- local-block: /rules/kit.md is not inside the repository — name a file under ./rules/',
      ],
    },
    {
      condition: 'a local block has no front matter',
      layout: {
        config: configOf({
          implementations: `[${localPath('kit')}]`,
        }),
        files: {
          'rules/implementations/kit.md': '# Kit\n',
        },
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('kit')} has no front matter — open it with the block's manifest between --- lines`,
      ],
    },
    {
      condition: 'a local block cannot be read',
      layout: {
        config: configOf({
          implementations: `[${localPath('kit')}]`,
        }),
        files: localBlockFiles({
          id: 'kit',
        }),
        unreadable: [
          'rules/implementations/kit.md',
        ],
      },
      warnings: [
        WARNINGS,
        `- local-block: ${localPath('kit')} cannot be read — make it readable`,
      ],
    },
    {
      condition: 'a local language has no tool for a role of an active rule',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git]',
          languages: `[${localPath('elixir')}]`,
        }),
        files: localBlockFiles({
          fields: {
            kind: 'context',
          },
          id: 'elixir',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by secrets have no tool for elixir — add one, such as betterleaks, or override them',
      ],
    },
    {
      condition: 'a tool of no language lists a role tied to a language',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git, betterleaks, markdownlint]',
          languages: '[python]',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by lint have no tool for python — add one, such as ruff, or override them',
      ],
    },
    {
      condition:
        'two languages are active and a rule of the role holds for one',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git, betterleaks]',
          languages: '[typescript, python]',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by lint have no tool for python — add one, such as ruff, or override them',
      ],
    },
    {
      condition: 'the first tool of the role in the index is abstract',
      layout: {
        config: configOf({
          domains:
            '[ui, untrusted-client, unreliable-network, version-control]',
          implementations: '[react-dom, git, betterleaks]',
          languages: '[typescript]',
          platforms: '[browser]',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by lint have no tool for typescript — add one, such as biome, or override them',
      ],
    },
    {
      condition:
        'an application needs a role that a top-level local tool checks',
      layout: {
        config: configOf({
          apps: '\n  web:\n    domains: [ui, untrusted-client, unreliable-network]\n    platforms: [browser]\n    implementations: [react-dom]',
          domains: '[version-control]',
          implementations: `[git, betterleaks, ${localPath('lint-kit')}]`,
          languages: '[typescript]',
        }),
        files: localBlockFiles({
          fields: {
            checks: '[lint]',
            requires: '[typescript]',
          },
          id: 'lint-kit',
        }),
      },
      warnings: [],
    },
    {
      condition: 'an override ends today',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git]',
          languages: '[typescript]',
          overrides: `\n  - rule: no-secret-in-code\n    level: MAY\n    reason: "none yet"\n    until: ${HOOK_TODAY}`,
        }),
      },
      warnings: [],
    },
    {
      condition:
        "an application's override lowers the rule no tool checks there",
      layout: {
        config: configOf({
          apps: '\n  web:\n    languages: [typescript]\n    overrides:\n      - rule: no-secret-in-code\n        level: MAY\n        reason: "none yet"',
          domains: '[version-control]',
          implementations: '[git]',
        }),
      },
      warnings: [],
    },
    {
      condition:
        "an application's override lowers the requirement its library does not meet",
      layout: {
        config: configOf({
          apps: '\n  web:\n    domains: [analytics]\n    implementations: [matomo]\n    overrides:\n      - rule: analytics-consent-first\n        level: SHOULD\n        reason: "no banner yet"',
        }),
      },
      warnings: [],
    },
    {
      condition: 'no active tool checks a role of an active MUST rule',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git]',
          languages: '[typescript]',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by secrets have no tool for typescript — add one, such as betterleaks, or override them',
      ],
    },
    {
      condition:
        'an application needs a tool that the rest of the repository does not',
      layout: {
        config: configOf({
          apps: '\n  web:\n    languages: [typescript]',
          domains: '[version-control]',
          implementations: '[git]',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by secrets have no tool for typescript in web — add one, such as betterleaks, or override them',
      ],
    },
    {
      condition: 'an application lacks the tool the repository lacks',
      layout: {
        config: configOf({
          apps: '\n  web:\n    domains: [ui]',
          domains: '[version-control]',
          implementations: '[git]',
          languages: '[typescript]',
        }),
      },
      warnings: [
        WARNINGS,
        '- no-tool: rules checked by secrets have no tool for typescript — add one, such as betterleaks, or override them',
      ],
    },
    {
      condition: 'an active library does not meet an active requirement',
      layout: {
        config: configOf({
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
      condition: 'an application shares the library that misses a requirement',
      layout: {
        config: configOf({
          apps: '\n  web:\n    domains: [ui]',
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
      condition: 'an override has expired',
      layout: {
        config: configOf({
          domains: '[ui]',
          overrides: fourDataStatesOverride(
            '    level: MAY\n    reason: "later"\n    until: 2020-01-01',
          ),
        }),
      },
      warnings: [
        WARNINGS,
        '- override: four-data-states expired on 2020-01-01 — renew or remove it',
      ],
    },
    {
      condition: 'an override names no rule',
      layout: {
        config: configOf({
          overrides:
            '\n  - rule: four-states\n    level: MAY\n    reason: "later"',
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
    {
      condition: 'an override lowers the rule no tool checks',
      layout: {
        config: configOf({
          domains: '[version-control]',
          implementations: '[git]',
          languages: '[typescript]',
          overrides:
            '\n  - rule: no-secret-in-code\n    level: MAY\n    reason: "no secrets exist"',
        }),
      },
      warnings: [],
    },
    {
      condition: 'an override lowers the requirement a library does not meet',
      layout: {
        config: configOf({
          domains: '[analytics]',
          implementations: '[matomo]',
          overrides:
            '\n  - rule: analytics-consent-first\n    level: SHOULD\n    reason: "no banner yet"',
        }),
      },
      warnings: [],
    },
  ])('should warn as listed when $condition', ({ layout, warnings }) => {
    // Arrange
    const project = createProject(layout);

    // Act
    const printed = warningsOf(
      contextOf(
        runHook({
          project,
          event: 'subagent',
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
  ])(
    'should print warnings up to 1,000 bytes when $condition',
    ({ domains, warnings }) => {
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
            event: 'subagent',
            root,
          }),
        ),
      );

      // Assert
      expect(printed).toStrictEqual(warnings);
    },
  );

  it.each<DigestCase>([
    {
      context: browserAppContext,
      layout: BROWSER_APP,
      project: 'a browser application with a local block and an override',
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
      context: localBlocksContext,
      layout: LOCAL_PROJECT,
      project: 'one of local blocks, one of them in an application',
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
          event: 'startup',
          root,
        }),
      );

      // Assert
      expect(printed).toBe(context(root));
    },
  );

  it.each<TailCase>([
    {
      blocks: 34,
      tail: [
        'The MUST headlines of 28 blocks were left out; the block files hold them.',
      ],
    },
    {
      blocks: 120,
      tail: [
        '55 more lines of the block list did not fit; constitution.yaml names every block.',
        '',
        'The MUST headlines of 120 blocks were left out; the block files hold them.',
      ],
    },
  ])(
    'should say what was left out when $blocks domains are active beside core',
    ({ blocks, tail }) => {
      // Arrange
      const project = createProject(syntheticProject(blocks));

      // Act
      const context = contextOf(
        runHook({
          project,
          event: 'startup',
          root,
        }),
      );

      // Assert
      expect(
        lastLinesOf({
          context,
          count: tail.length,
        }),
      ).toStrictEqual(tail);
    },
  );

  it.each([
    {
      blocks: 34,
    },
    {
      blocks: 120,
    },
  ])(
    'should keep the text after the header within 9,400 bytes when $blocks domains are active beside core',
    ({ blocks }) => {
      // Arrange
      const project = createProject(syntheticProject(blocks));

      // Act
      const bytes = bytesAfterHeader(
        contextOf(
          runHook({
            project,
            event: 'startup',
            root,
          }),
        ),
      );

      // Assert
      expect(bytes).toBeLessThanOrEqual(BUDGET);
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
          event: 'subagent',
          root: REPOSITORY,
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
      pin: '1.0\u00020',
      shown: '1.0\u00020',
      what: 'the control byte 0x02',
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
          event: 'subagent',
          project,
          root,
        }),
      );

      // Assert
      expect(output).toStrictEqual({
        context: coreOnlyContext({
          pin: shown,
          root,
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
      event: 'subagent',
      project,
      root,
    });

    // Assert
    expect(run.stdout).toContain('pins 1.0\\u007f0;');
  });

  it('should give every override the headline of its rule, in the order of the file, when a project overrides rules', () => {
    // Arrange
    const project = createProject({
      config: configOf({
        apps: '\n  web:\n    overrides:\n      - rule: four-data-states\n        level: SHOULD\n        reason: "the kit decides"',
        domains: '[ui]',
        overrides: fourDataStatesOverride(
          '    level: MAY\n    reason: "a prototype"',
        ),
      }),
    });

    // Act
    const headline = headlineOf({
      context: contextOf(
        runHook({
          event: 'subagent',
          project,
          root,
        }),
      ),
      slug: 'four-data-states',
    });

    // Assert
    expect(headline).toBe(
      '- four-data-states (SHOULD in web; MAY): Every data view shows loading, empty, error and content.',
    );
  });

  // Core's part sets how much room is left: the line naming core's files takes
  // 67 bytes, the gap and heading of the block list 42, a synthetic domain's
  // line 88 and the gap, heading and three headlines of its block 436.
  it.each<EdgeCase>([
    {
      condition: 'the last headline block ends on the budget, reserve kept',
      corePart: 8567,
      domains: '[synthetic-001]',
      tail: [
        '- synthetic-001-rule-3: The synthetic-001 rule number 3 holds for every file, and its headline is long enough to weigh on the byte budget.',
      ],
    },
    {
      condition: 'the last headline block passes the budget by one byte',
      corePart: 8568,
      domains: '[synthetic-001]',
      tail: [
        '- synthetic-001: Block synthetic-001 pads the digest to prove its byte budget holds up.',
        '',
        LEFT_OUT_ONE,
      ],
    },
    {
      condition: 'a block that does not fit comes before one that would',
      corePart: 8745,
      domains: '[synthetic-001, untrusted-client]',
      tail: [
        '- untrusted-client: Code on a machine the user controls.',
        '',
        'The MUST headlines of 2 blocks were left out; the block files hold them.',
      ],
    },
    {
      condition: 'the heading of the block list ends on the budget',
      corePart: 9091,
      domains: '[synthetic-001]',
      tail: [
        '## Domains (blocks/domains/<id>/<id>.md)',
        '1 more line of the block list did not fit; constitution.yaml names every block.',
        '',
        LEFT_OUT_ONE,
      ],
    },
    {
      condition: 'the heading of the block list passes the budget by one byte',
      corePart: 9092,
      domains: '[synthetic-001]',
      tail: [
        '',
        '2 more lines of the block list did not fit; constitution.yaml names every block.',
        '',
        LEFT_OUT_ONE,
      ],
    },
  ])(
    'should cut where the budget ends when $condition',
    ({ corePart, domains, tail }) => {
      // Arrange
      const plugin = createPluginRoot({
        corePart: corePartOfBytes(corePart),
      });
      const project = createProject({
        config: configOf({
          domains,
        }),
      });

      // Act
      const context = contextOf(
        runHook({
          event: 'startup',
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
    },
  );

  it('should fill the budget to its last byte when the last headline block ends on it', () => {
    // Arrange
    const plugin = createPluginRoot({
      corePart: corePartOfBytes(8567),
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
          event: 'startup',
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
      event: 'startup',
      name: 'SessionStart',
    },
    {
      event: 'compact',
      name: 'SessionStart',
    },
    {
      event: 'subagent',
      name: 'SubagentStart',
    },
  ])(
    'should name the event $name when the hook runs at $event',
    ({ event, name }) => {
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
    },
  );

  it.each<FailureCase>([
    {
      breakage: 'digests/index.tsv',
      condition: 'the plugin root lacks digests/index.tsv',
      layout: CLI,
      stderr: ({ plugin }): string =>
        `constitution hook: cannot read ${plugin}/digests/index.tsv\n`,
    },
    {
      breakage: 'digests/core.md',
      condition: 'the plugin root lacks digests/core.md',
      layout: CLI,
      stderr: ({ plugin }): string =>
        `constitution hook: cannot read ${plugin}/digests/core.md\n`,
    },
    {
      breakage: 'version',
      condition: "the plugin's package.json has no version",
      layout: CLI,
      stderr: ({ plugin }): string =>
        `constitution hook: ${plugin}/package.json has no version\n`,
    },
    {
      breakage: 'hooks/lib/resolve.awk',
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
        event: 'startup',
        project,
        root: plugin,
      });

      // Assert
      expect(run).toStrictEqual<HookRun>({
        exitCode: 1,
        stderr: stderr({
          plugin,
          project,
        }),
        stdout: '',
      });
    },
  );

  it.each<BlockListCase>([
    {
      condition:
        "a top-level block's with/ file is active only in an application",
      layout: {
        config: configOf({
          apps: '\n  packages/web:\n    domains: [remote-data]',
          domains: '[ui]',
        }),
      },
      lines: [
        '## Domains (blocks/domains/<id>/<id>.md)',
        '- ui: Screens and what a user sees on them. Also: forms.md',
        '## packages/web',
        '- remote-data (domains): Data another system owns.',
        '- ui (domains): Also: with/remote-data.md',
      ],
    },
  ])(
    'should list the active blocks as given when $condition',
    ({ layout, lines }) => {
      // Arrange
      const project = createProject(layout);

      // Act
      const list = blockListOf(
        contextOf(
          runHook({
            event: 'subagent',
            project,
            root,
          }),
        ),
      );

      // Assert
      expect(list).toStrictEqual(lines);
    },
  );
});
