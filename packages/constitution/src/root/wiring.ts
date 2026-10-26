import { Command } from 'commander';

import { createNodeProjectFiles } from '#/adapters/file-system';
import { createGitWorkingTree } from '#/adapters/git';
import { createCheckCommand } from '#/composition/check';
import { createProjectConfigurationsCheck } from '#/composition/digest/adapters/configurations';
import { createProjectSource } from '#/composition/project-source/adapters/project';
import type { Validation } from '#/features/blocks';
import { checkBlocks, createBlocksCheckCommand } from '#/features/blocks';
import { createGitFileTrees } from '#/features/blocks/adapters/git';
import { createJsonManifestParser } from '#/features/blocks/adapters/json';
import { createYamlFrontMatterParser } from '#/features/blocks/adapters/yaml';
import type { PartDiagnosis } from '#/features/installation';
import { createDoctorCommand, diagnoseInstallation } from '#/features/installation';
import { createClaudePluginRegistry } from '#/features/installation/adapters/claude-code';
import { createGitHubReleaseFeed } from '#/features/installation/adapters/github';
import { createLefthookGitHooks } from '#/features/installation/adapters/lefthook';
import { createPathProgram } from '#/features/installation/adapters/path';
import type {
  ApplyReport,
  ConfigurationsCheck,
  PresetsPlan,
  RunAsked,
  RunPlan,
} from '#/features/presets';
import {
  applyPresets,
  checkConfigurations,
  checkPresets,
  configurationsStepOf,
  createPresetsApplyCommand,
  createPresetsCheckCommand,
  createPresetsPlanCommand,
  createRunCommand,
  planPresets,
  planRun,
  presetsStepOf,
} from '#/features/presets';
import { createConfigurationFormat } from '#/features/presets/adapters/configuration';
import {
  createFileAppliedFilesRepository,
  createFileLockRepository,
  createManifestReleaseBuilds,
} from '#/features/presets/adapters/file-system';
import { createShellCommandRunner } from '#/features/presets/adapters/process';
import { createYamlPresetFileParser } from '#/features/presets/adapters/yaml';
import { createConfigFileParser } from '#/features/project/adapters/config-file';
import { createManifestWorkspace } from '#/features/project/adapters/workspace';
import { createYamlBlockCardParser } from '#/features/project/adapters/yaml';
import type {
  Reminder,
  SessionDigest,
  SessionId,
  SessionStart,
  StopEvent,
  StopJudgement,
} from '#/features/session';
import {
  createPostToolUseCommand,
  createRecordCheckCommand,
  createSessionStartCommand,
  createStopCommand,
  createUserPromptSubmitCommand,
  digestSession,
  judgeStop,
  keepSession,
  markTurn,
  recordCheck,
  recordJudgement,
  recordReminders,
  remindOfFile,
} from '#/features/session';
import { createXdgSessionRepository } from '#/features/session/adapters/session-store';
import { PROGRAM_NAME } from '#/kernel/constants';
import type { BlockModel } from '#/kernel/entities';
import { Version } from '#/kernel/value-objects';
import { configureHelpLayout } from '#/libs/commander';
import type { StepReport } from '#/shared/cli';
import { ExitCode, OUTPUT_FLAGS } from '#/shared/cli';

import { adopt, flagsOf, groupOf } from './command-tree.utils';
import { clockOf } from './configuration';
import type { ErrorHandler } from './error-handler';
import { createErrorHandler } from './error-handler';
import { createPresentation } from './presentation';
import type { Program, ProgramInput } from './program.types';
import type { Ports, Registration } from './registration.types';
import { stateFolderWarningText } from './state-folder-warning';

const HOOK = 'hook';
// The time each outside call may take: a run of git, of a program on PATH, of lefthook, and the
// call that asks GitHub for the latest release.
const GIT_TIMEOUT_MS = 30_000;
const PROGRAM_TIMEOUT_MS = 5000;
const LEFTHOOK_TIMEOUT_MS = 10_000;
const RELEASE_TIMEOUT_MS = 3000;
// The files a folder of a release or a pack lists at most, the workspace's folders in one look, and
// the globs one workspace glob's braces spell out.
const FOLDER_FILES = 10_000;
const WORKSPACE_FOLDERS = 10_000;
const WORKSPACE_GLOBS = 1000;

const portsOf = (input: ProgramInput): Ports => {
  const files = createNodeProjectFiles({
    maxFiles: FOLDER_FILES,
  });
  const presetFiles = createYamlPresetFileParser();
  const builds = createManifestReleaseBuilds({
    manifest: 'package.json',
  });
  const formats = createConfigurationFormat();

  return {
    builds,
    commands: createShellCommandRunner(),
    presetFiles,
    files,
    formats,
    sessions: createXdgSessionRepository({
      ...input.environment.sessions,
      maxSessions: FOLDER_FILES,
      now: (): Temporal.Instant => Temporal.Now.instant(),
      warn: (warning): void => input.io.writeError(stateFolderWarningText(warning)),
    }),
    source: createProjectSource({
      cardParser: createYamlBlockCardParser(),
      clock: clockOf(input.environment.today),
      configParser: createConfigFileParser(),
      files,
      workspace: createManifestWorkspace({
        maxFolders: WORKSPACE_FOLDERS,
        maxGlobs: WORKSPACE_GLOBS,
      }),
    }),
    configurations: createProjectConfigurationsCheck({
      files,
      formats,
      builds,
      lockOf: createFileLockRepository().read,
      parser: presetFiles,
    }),
    workingTree: createGitWorkingTree({
      env: input.environment.commands,
      timeoutMs: GIT_TIMEOUT_MS,
    }),
  };
};

const hookCommandsOf = ({ context, ports, program }: Registration): Command =>
  adopt(
    groupOf({
      context,
      description: "Serve one of Claude Code's hooks, its event read from standard input.",
      examples: [
        `printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}' "$PWD" | constitution hook session-start`,
      ],
      name: HOOK,
      parent: program,
    }),
    [
      createSessionStartCommand({
        ...context,
        digestSession: (start: SessionStart): SessionDigest | undefined =>
          digestSession({
            ...ports,
            ...start,
          }),
        keepSession: (kept): void => {
          keepSession({
            ...kept,
            sessions: ports.sessions,
          });
        },
      }),
      createPostToolUseCommand({
        ...context,
        recordReminders: (named): void => {
          recordReminders({
            ...named,
            sessions: ports.sessions,
          });
        },
        remindOfFile: (asked): Reminder | undefined =>
          remindOfFile({
            ...asked,
            sessions: ports.sessions,
          }),
      }),
      createRecordCheckCommand({
        ...context,
        recordCheck: (asked): void => {
          recordCheck({
            ...asked,
            ...ports,
          });
        },
      }),
      createUserPromptSubmitCommand({
        ...context,
        markTurn: (session: SessionId): void => {
          markTurn({
            ...ports,
            session,
          });
        },
      }),
      createStopCommand({
        ...context,
        judgeStop: (event: StopEvent): StopJudgement | undefined =>
          judgeStop({
            ...event,
            ...ports,
          }),
        recordJudgement: (judged): void => {
          recordJudgement({
            ...judged,
            sessions: ports.sessions,
          });
        },
      }),
    ],
  );

const doctorCommandOf = ({ context, ports, programInput }: Registration): Command =>
  createDoctorCommand({
    ...context,
    diagnoseInstallation: async (start: string): Promise<readonly PartDiagnosis[]> =>
      await diagnoseInstallation({
        files: ports.files,
        fingerprint: programInput.pluginFingerprint(),
        hooks: createLefthookGitHooks({
          env: programInput.environment.commands,
          timeoutMs: LEFTHOOK_TIMEOUT_MS,
        }),
        path: createPathProgram({
          env: programInput.environment.commands,
          timeoutMs: PROGRAM_TIMEOUT_MS,
        }),
        plugins: createClaudePluginRegistry({
          configFolder: programInput.environment.claudeConfig,
          pluginRoot: programInput.environment.pluginRoot,
        }),
        releases: createGitHubReleaseFeed({
          fetch: programInput.fetch,
          timeoutMs: RELEASE_TIMEOUT_MS,
        }),
        source: ports.source,
        start,
        program: Version.create(programInput.version),
      }),
  });

const configurationsCheckOf = (input: {
  ports: Ports;
  start: string;
}): ConfigurationsCheck | undefined =>
  checkConfigurations({
    files: input.ports.files,
    formats: input.ports.formats,
    locks: createFileLockRepository(),
    builds: input.ports.builds,
    parser: input.ports.presetFiles,
    source: input.ports.source,
    start: input.start,
  });

const planRunOf =
  (ports: Ports) =>
  (asked: RunAsked): RunPlan =>
    planRun({
      ...asked,
      builds: ports.builds,
      files: ports.files,
      parser: ports.presetFiles,
      source: ports.source,
    });

const presetsCommandsOf = ({ context, ports, program }: Registration): Command =>
  adopt(
    groupOf({
      context,
      description:
        "Check, plan and apply the configurations the project's tools take from the presets.",
      examples: [
        'constitution presets check',
        'constitution presets plan',
        'constitution presets apply',
      ],
      name: 'presets',
      parent: program,
    }),
    [
      createPresetsCheckCommand({
        ...context,
        checkConfigurations: (start: string): ConfigurationsCheck | undefined =>
          configurationsCheckOf({
            ports,
            start,
          }),
      }),
      createPresetsPlanCommand({
        ...context,
        planPresets: (start: string): PresetsPlan =>
          planPresets({
            files: ports.files,
            builds: ports.builds,
            parser: ports.presetFiles,
            source: ports.source,
            start,
          }),
      }),
      createPresetsApplyCommand({
        ...context,
        planRun: planRunOf(ports),
        runCommand: ports.commands.run,
        applyPresets: (start: string): ApplyReport | undefined =>
          applyPresets({
            files: ports.files,
            formats: ports.formats,
            locks: createFileLockRepository(),
            builds: ports.builds,
            parser: ports.presetFiles,
            source: ports.source,
            start,
            writes: createFileAppliedFilesRepository(),
          }),
      }),
    ],
  );

const registerCommands = (registration: Registration): void => {
  const { context, ports, program, programInput } = registration;

  const checkBlocksIn = (asked: {
    base: string | undefined;
    folder: string;
  }): Validation | undefined =>
    checkBlocks({
      ...(asked.base === undefined
        ? {}
        : {
            base: asked.base,
          }),
      files: ports.files,
      folder: asked.folder,
      frontMatterParser: createYamlFrontMatterParser(),
      manifestParser: createJsonManifestParser(),
      trees: createGitFileTrees({
        env: programInput.environment.commands,
        maxFiles: FOLDER_FILES,
        timeoutMs: GIT_TIMEOUT_MS,
      }),
    });

  adopt(program, [
    createCheckCommand({
      ...context,
      checkBlocks: checkBlocksIn,
      checkPresets: (asked: {
        folder: string;
        isRelease: boolean;
        model: BlockModel | undefined;
      }): StepReport =>
        presetsStepOf(
          asked.model === undefined
            ? undefined
            : checkPresets({
                ...asked,
                files: ports.files,
                model: asked.model,
                builds: ports.builds,
                parser: ports.presetFiles,
              }),
        ),
      checkConfigurations: (start: string): StepReport =>
        configurationsStepOf(
          configurationsCheckOf({
            ports,
            start,
          }),
        ),
    }),
    adopt(
      groupOf({
        context,
        description: 'Check the blocks of a Constitution or a pack.',
        examples: [
          'constitution blocks check',
        ],
        name: 'blocks',
        parent: program,
      }),
      [
        createBlocksCheckCommand({
          ...context,
          checkBlocks: checkBlocksIn,
        }),
      ],
    ),
    presetsCommandsOf(registration),
    createRunCommand({
      ...context,
      planRun: planRunOf(ports),
      runCommand: ports.commands.run,
    }),
    hookCommandsOf(registration),
    doctorCommandOf(registration),
  ]);
};

const createProgram = (input: ProgramInput): Program => {
  const program = new Command(PROGRAM_NAME);
  let running: Command | undefined;
  let isFailed = false;
  const presentation = createPresentation({
    accent: input.accent,
    env: input.environment.output,
    flags: () => flagsOf(program.opts()),
    io: input.io,
    isTerminal: input.isTerminal,
    streams: input.streams,
  });
  const errors: ErrorHandler = createErrorHandler({
    isHook: () => running?.parent?.name() === HOOK,
    theme: presentation.theme,
    writeError: input.io.writeError,
  });
  const helpExamples = configureHelpLayout(program, presentation.theme);

  program
    .description(
      'The rules a repository is built by: checks a Constitution, a pack and a project, and serves the hooks of Claude Code.',
    )
    .version(input.version, '--version', 'print the version')
    .configureOutput({
      outputError: (message: string): void => {
        errors.writeUsage(message);
      },
      writeErr: input.io.writeError,
      writeOut: input.io.write,
    })
    .exitOverride()
    .showSuggestionAfterError(true)
    .hook('preAction', (_program: Command, action: Command): void => {
      running = action;
    });

  for (const flag of OUTPUT_FLAGS) {
    program.option(flag.flags, flag.description);
  }

  program.addHelpText(
    'before',
    helpExamples([
      'constitution check',
      'constitution doctor',
      'constitution presets plan',
    ]),
  );

  return {
    fail: errors.codeOf,
    run: async (args: readonly string[]): Promise<ExitCode> => {
      try {
        // building the ports parses the configuration: a malformed setting fails the start here
        registerCommands({
          ports: portsOf(input),
          context: {
            io: input.io,
            places: input.places,
            renderer: presentation.renderer,
            setFailed: (): void => {
              isFailed = true;
            },
            helpExamples,
          },
          program,
          programInput: input,
        });

        await program.parseAsync(args, {
          from: 'user',
        });
        await presentation.close();

        return isFailed ? ExitCode.Failure : ExitCode.Success;
      } catch (error) {
        // the terminal is restored before the failure is written below what was drawn
        await presentation.close();

        return errors.codeOf(error);
      }
    },
    stop: presentation.close,
  };
};

export { createProgram };
