import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { coreText } from '../constitution.fixtures';
import {
  BROWSER_APP_WITH_PACK_AND_OVERRIDE_NAMES,
  EVERY_CODE_NAMES,
  EVERY_CODE_WARNINGS,
} from '../digests.fixtures';
import type { HookRun } from '../hook.fixtures';
import {
  BUDGET,
  bytesAfterHeader,
  CONTEXT_CAP,
  contextOf,
  HookEvent,
  headerOf,
  mapOf,
  mentionedOf,
  namedInMapOf,
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
  browserAppWithPackAndOverride,
  ConfigKey,
  cliInBlockSequences,
  configOf,
  createProject,
  lineNumberOf,
  Repository,
  ratifiedFromTemplates,
  referenceCli,
  referenceWebApp,
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

interface DigestCase {
  layout: ProjectLayout;
  names: readonly string[];
  project: string;
  warnings: readonly (readonly string[])[];
}

interface NoticeCase {
  condition: string;
  link: (project: string) => void;
  unlinked?: boolean | undefined;
}

const found = configOf({
  domains: '[version-control]',
  implementations: '[git]',
});

const fourDataStatesOverride = (fields: string): string =>
  `\n  - rule: four-data-states\n${fields}`;

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
const MEMBERS = 40;
const memberNames = Array.from(
  {
    length: MEMBERS,
  },
  (_, index) => `packages/member-${String(index + 1).padStart(2, '0')}`,
);
const largeWorkspace: ProjectLayout = {
  config: found,
  files: workspaceOf(
    Object.fromEntries(
      memberNames.map((member) => [
        member,
        configOf({
          domains: '[ui, i18n, analytics, remote-data, untrusted-client, unreliable-network]',
          implementations: '[react-dom, tanstack-query, matomo, biome, lefthook, betterleaks]',
          languages: '[typescript]',
          platforms: '[browser]',
        }),
      ]),
    ),
  ),
};
const DOCTOR = 'constitution doctor';

const distributionIn = (project: string): string => join(project, LINK);

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
      layout: cliInBlockSequences,
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
      layout: cliInBlockSequences,
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
    'should find the project and name its blocks when $condition',
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
      const context = contextOf(
        runHook({
          cwd,
          event: HookEvent.Subagent,
          nonUtf8Byte,
          project,
          projectDir,
          root,
          spawnOutside,
        }),
      );

      // Assert
      expect(
        namedInMapOf({
          context,
          names: [
            'version-control',
            'git',
            'ui',
          ],
        }),
      ).toStrictEqual([
        'version-control',
        'git',
      ]);
    },
  );

  it('should read the files without a warning when they are written from the templates', () => {
    // Arrange
    const project = createProject(ratifiedFromTemplates);

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
      names: namedInMapOf({
        context,
        names: [
          'i18n',
          'version-control',
          'typescript',
          'betterleaks',
          'git',
          'paraglide',
          'pack',
        ],
      }),
      warnings: warningsOf({
        context,
        like: [],
      }),
    }).toStrictEqual({
      names: [
        'i18n',
        'version-control',
        'typescript',
        'betterleaks',
        'git',
        'paraglide',
        'pack',
      ],
      warnings: [],
    });
  });

  it.each<DigestCase>([
    {
      layout: browserAppWithPackAndOverride,
      names: BROWSER_APP_WITH_PACK_AND_OVERRIDE_NAMES,
      project: 'a browser application with a block of its own pack and an override',
      warnings: [],
    },
    {
      layout: everyCode,
      names: EVERY_CODE_NAMES,
      project: 'one that sets off a warning of every code',
      warnings: EVERY_CODE_WARNINGS,
    },
  ])(
    'should name the release, give core whole, name the active blocks in the map and give each warning by its code when the project is $project',
    ({ layout, names, warnings }) => {
      // Arrange
      const project = createProject(layout);

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
        holdsCore: context.includes(coreText),
        names: namedInMapOf({
          context,
          names,
        }),
        release: mentionedOf({
          names: [
            distributionIn(project),
          ],
          text: headerOf(context),
        }),
        warnings: warningsOf({
          context,
          like: warnings,
        }),
      }).toStrictEqual({
        holdsCore: true,
        names,
        release: [
          distributionIn(project),
        ],
        warnings,
      });
    },
  );

  it('should give core whole, name the line constitution.yaml stops parsing at and give no map when it does not parse', () => {
    // Arrange
    const project = createProject({
      config: unparsedConfig,
    });
    const line = String(
      lineNumberOf({
        at: '&listed',
        config: unparsedConfig,
      }),
    );

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
      holdsCore: context.includes(coreText),
      map: mapOf(context),
      named: mentionedOf({
        names: [
          'constitution.yaml',
          line,
        ],
        text: headerOf(context),
      }),
    }).toStrictEqual({
      holdsCore: true,
      map: [],
      named: [
        'constitution.yaml',
        line,
      ],
    });
  });

  it('should keep the digest within 9,400 bytes after its header, core whole and the map cut from its last members, when a workspace of 40 members passes the budget', () => {
    // Arrange
    const project = createProject(largeWorkspace);

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
      holdsCore: context.includes(coreText),
      isWithinBudget: bytesAfterHeader(context) <= BUDGET,
      named: namedInMapOf({
        context,
        names: [
          'version-control',
          'git',
          'packages/member-01',
          'packages/member-40',
        ],
      }),
    }).toStrictEqual({
      holdsCore: true,
      isWithinBudget: true,
      named: [
        'version-control',
        'git',
        'packages/member-01',
      ],
    });
  });

  it.each([
    {
      layout: referenceWebApp,
      shape: 'the reference web application',
    },
    {
      layout: referenceCli,
      shape: 'the reference command-line tool',
    },
  ])(
    'should give the digest whole within the cap of the context and warn of nothing when $shape follows the real blocks',
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
        isWithinCap: context.length <= CONTEXT_CAP,
        warnings: warningsOf({
          context,
          like: [],
        }),
      }).toStrictEqual({
        isWithinCap: true,
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
      const project = createProject(cliInBlockSequences);
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
      ...cliInBlockSequences,
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
