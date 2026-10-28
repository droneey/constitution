import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { coreText } from '../constitution.fixtures';
import { browserAppContext, everyCodeContext, unparsedContext } from '../digests.fixtures';
import type { HookRun } from '../hook.fixtures';
import {
  BUDGET,
  bytesAfterHeader,
  contextOf,
  factNumberOf,
  HookEvent,
  indexOf,
  listCutOf,
  mentionedOf,
  newSession,
  removeSessions,
  runHook,
  stateFolderOf,
  warningsOf,
} from '../hook.fixtures';
import {
  Breakage,
  createPluginRoot,
  createRealPluginRoot,
  distributionOf,
  LINK,
  linkDistribution,
  removePluginRoots,
} from '../plugin-root.fixtures';
import type { ProjectLayout } from '../project.fixtures';
import {
  browserApp,
  ConfigKey,
  cli,
  configOf,
  createProject,
  lineNumberOf,
  Repository,
  ratified,
  realCli,
  realWebApp,
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

interface GoldenCase {
  context: (distribution: string) => string;
  layout: ProjectLayout;
  project: string;
}

interface NoticeCase {
  condition: string;
  // what the case links into the project before the hook runs, which then links nothing over it
  link: (project: string) => void;
  // no distribution is linked into the project
  unlinked?: boolean | undefined;
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
  domains: '&listed [ui]',
});
const DOCTOR = 'constitution doctor';

const distributionIn = (project: string): string => join(project, LINK);

// runHook links the release's distribution into a project that holds no link of its own.
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
      condition: 'the process starts outside the cwd the event names',
      cwd: 'src/deep',
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
          'packages/app/.keep': '',
          'src/deep/.keep': '',
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
        'paraglide [pack] (messages)',
      ],
      warnings: [],
    });
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
      context: (distribution): string =>
        unparsedContext({
          line: lineNumberOf({
            at: '&listed',
            config: unparsedConfig,
          }),
          root: distribution,
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
    expect(printed).toBe(context(distributionIn(project)));
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

  it.each<NoticeCase>([
    {
      condition: 'the project holds no distribution',
      link: linkNothing,
      unlinked: true,
    },
    {
      condition: 'the distribution lacks package.json',
      link: (project: string): void => {
        linkDistribution({
          distribution: distributionOf(
            createPluginRoot({
              breakage: Breakage.Manifest,
            }),
          ),
          project,
        });
      },
    },
    {
      condition: "the project's distribution link points nowhere",
      link: (project: string): void => {
        linkDistribution({
          distribution: join(project, 'gone'),
          project,
        });
      },
    },
  ])(
    'should point to doctor in one line and save no state when $condition',
    ({ link, unlinked }) => {
      // Arrange
      const project = createProject(cli);
      const session = newSession();

      link(project);

      // Act
      const run = runHook({
        event: HookEvent.Startup,
        project,
        root,
        session,
        unlinked,
      });

      // Assert
      const context = contextOf(run);
      // the one line names the distribution and the command that says what is wrong
      const names = [
        distributionIn(project),
        DOCTOR,
      ];

      expect({
        exitCode: run.exitCode,
        mentioned: mentionedOf({
          names,
          text: context,
        }),
        rules: context.includes(coreText),
        saved: existsSync(stateFolderOf(session)),
        stderr: run.stderr,
      }).toStrictEqual({
        exitCode: 0,
        mentioned: names,
        rules: false,
        saved: false,
        stderr: '',
      });
    },
  );

  it('should write one line of the hook to stderr, naming the file it stopped at, and exit 1 when constitution.yaml cannot be read', () => {
    // Arrange
    const project = createProject({
      ...cli,
      unreadable: [
        'constitution.yaml',
      ],
    });

    // Act
    const run = runHook({
      event: HookEvent.Startup,
      project,
      root,
    });

    // Assert
    expect({
      exitCode: run.exitCode,
      lines: run.stderr.trimEnd().split('\n').length,
      namesFile: run.stderr.includes(`${project}/constitution.yaml`),
      opensAsTheHook: run.stderr.startsWith('constitution hook: '),
      stdout: run.stdout,
    }).toStrictEqual({
      exitCode: 1,
      lines: 1,
      namesFile: true,
      opensAsTheHook: true,
      stdout: '',
    });
  });
});
