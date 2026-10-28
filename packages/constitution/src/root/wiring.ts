import { Command } from 'commander';

import { createNodeProjectFiles } from '#/adapters/file-system';
import { createCheckCommand } from '#/composition/check';
import {
  createPinnedRelease,
  createProjectReader,
  createRulesSource,
} from '#/composition/project-source/adapters/project';
import type { PackBase, Validation } from '#/features/blocks';
import { checkBlocks, createBlocksCheckCommand } from '#/features/blocks';
import { createGitFileTrees } from '#/features/blocks/adapters/git';
import { createJsonManifestParser } from '#/features/blocks/adapters/json';
import { createYamlFrontMatterParser } from '#/features/blocks/adapters/yaml';
import type { PartDiagnosis } from '#/features/installation';
import { createDoctorCommand, diagnoseInstallation } from '#/features/installation';
import { createClaudePluginRegistry } from '#/features/installation/adapters/claude-code';
import { createGitHubReleaseFeed } from '#/features/installation/adapters/github';
import { createLefthookGitHooks } from '#/features/installation/adapters/lefthook';
import { createPathExecutable } from '#/features/installation/adapters/path';
import type {
  AppliedFiles,
  ApplyPlan,
  ConfigurationsCheck,
  PresetsPlan,
  ProjectRead,
  RunAsked,
  RunPlan,
} from '#/features/presets';
import {
  applyChanges,
  checkConfigurations,
  checkPresets,
  configurationsStepOf,
  createPresetsApplyCommand,
  createPresetsCheckCommand,
  createPresetsPlanCommand,
  createRunCommand,
  planApply,
  planPresets,
  planRun,
  presetsSkippedStep,
  presetsStepOf,
} from '#/features/presets';
import { createConfigurationFormat } from '#/features/presets/adapters/configuration';
import {
  createDistributionMapSources,
  createFileAppliedFilesRepository,
  createFileLockRepository,
} from '#/features/presets/adapters/file-system';
import { createShellCommandRunner } from '#/features/presets/adapters/process';
import { createYamlPresetFileParser } from '#/features/presets/adapters/yaml';
import { createJsonReleaseManifestParser } from '#/features/project/adapters/json';
import { createManifestWorkspace } from '#/features/project/adapters/workspace';
import {
  createYamlBlockCardParser,
  createYamlConfigFileParser,
} from '#/features/project/adapters/yaml';
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
import { createGitWorkingTree } from '#/features/session/adapters/git';
import { createXdgSessionRepository } from '#/features/session/adapters/session-store';
import { EXECUTABLE_NAME } from '#/kernel/constants';
import type { AbsolutePath } from '#/kernel/value-objects';
import { Version } from '#/kernel/value-objects';
import { configureHelpLayout } from '#/libs/commander';
import type { StepReport } from '#/shared/cli';
import { ExitCode, OUTPUT_FLAGS } from '#/shared/cli';

import { adopt, flagsOf, groupOf } from './command-tree.utils';
import { clockOf } from './configuration';
import { DISTRIBUTION_MAP_NAME, PACKAGE_BUILDS } from './distribution.constants';
import type { ErrorHandler } from './error-handler';
import { createErrorHandler } from './error-handler';
import { HOOK_GROUP } from './hook.constants';
import { createPresentation } from './presentation';
import type { Program, ProgramInput } from './program.types';
import type { Ports, PresetsInput, Registration } from './registration.types';
import { stateFolderWarningText } from './state-folder-warning';

const GIT_TIMEOUT_MS = 30_000;
const EXECUTABLE_TIMEOUT_MS = 5000;
const LEFTHOOK_TIMEOUT_MS = 10_000;
const RELEASE_TIMEOUT_MS = 3000;
const FOLDER_FILES = 10_000;
const WORKSPACE_FOLDERS = 10_000;
const WORKSPACE_GLOBS = 1000;

/** @throws {ConfigurationError} when the day is written otherwise than YYYY-MM-DD */
const portsOf = (input: ProgramInput): Ports => {
  const files = createNodeProjectFiles({
    maxFiles: FOLDER_FILES,
  });
  const presetFiles = createYamlPresetFileParser();
  const distribution = createDistributionMapSources({
    builds: PACKAGE_BUILDS,
    mapName: DISTRIBUTION_MAP_NAME,
  });
  const formats = createConfigurationFormat();
  const locks = createFileLockRepository();
  const project = {
    cardParser: createYamlBlockCardParser(),
    clock: clockOf(input.environment.today),
    configParser: createYamlConfigFileParser(),
    files,
    manifestParser: createJsonReleaseManifestParser(),
    workspace: createManifestWorkspace({
      maxFolders: WORKSPACE_FOLDERS,
      maxGlobs: WORKSPACE_GLOBS,
    }),
  };

  return {
    appliedFiles: createFileAppliedFilesRepository(),
    commands: createShellCommandRunner(),
    distribution,
    files,
    formats,
    locks,
    pinned: createPinnedRelease(project),
    presetFiles,
    reader: createProjectReader(project),
    rules: createRulesSource({
      presets: {
        distribution,
        formats,
        lockOf: locks.read,
        parser: presetFiles,
      },
      project,
    }),
    sessions: createXdgSessionRepository({
      ...input.environment.sessions,
      maxSessions: FOLDER_FILES,
      now: (): Temporal.Instant => Temporal.Now.instant(),
      warn: (warning): void => input.io.writeError(stateFolderWarningText(warning)),
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
      name: HOOK_GROUP,
      parent: program,
    }),
    [
      createSessionStartCommand({
        ...context,
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        digestSession: (start: SessionStart): SessionDigest | undefined =>
          digestSession({
            ...start,
            source: ports.rules,
            workingTree: ports.workingTree,
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
    diagnoseInstallation: (startFolderPath: AbsolutePath): Promise<readonly PartDiagnosis[]> =>
      diagnoseInstallation({
        executable: Version.create(programInput.version),
        files: ports.files,
        fingerprint: programInput.pluginFingerprint(),
        hooks: createLefthookGitHooks({
          env: programInput.environment.commands,
          timeoutMs: LEFTHOOK_TIMEOUT_MS,
        }),
        path: createPathExecutable({
          env: programInput.environment.commands,
          timeoutMs: EXECUTABLE_TIMEOUT_MS,
        }),
        plugins: createClaudePluginRegistry({
          configFolder: programInput.environment.claudeConfig,
          pluginRoot: programInput.environment.pluginRoot,
        }),
        pinned: ports.pinned,
        releases: createGitHubReleaseFeed({
          fetch: programInput.fetch,
          timeoutMs: RELEASE_TIMEOUT_MS,
        }),
        startFolderPath,
      }),
  });

const presetsInputOf =
  (ports: Ports) =>
  (startFolderPath: AbsolutePath): PresetsInput => ({
    distribution: ports.distribution,
    files: ports.files,
    formats: ports.formats,
    locks: ports.locks,
    parser: ports.presetFiles,
    reader: ports.reader,
    startFolderPath,
  });

const planRunOf =
  (ports: Ports) =>
  (asked: RunAsked): ProjectRead<RunPlan> =>
    planRun({
      ...asked,
      distribution: ports.distribution,
      files: ports.files,
      formats: ports.formats,
      parser: ports.presetFiles,
      reader: ports.reader,
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
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        checkConfigurations: (startFolderPath: AbsolutePath): ProjectRead<ConfigurationsCheck> =>
          checkConfigurations(presetsInputOf(ports)(startFolderPath)),
      }),
      createPresetsPlanCommand({
        ...context,
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        planPresets: (startFolderPath: AbsolutePath): ProjectRead<PresetsPlan> =>
          planPresets(presetsInputOf(ports)(startFolderPath)),
      }),
      createPresetsApplyCommand({
        ...context,
        /** @throws {ApplyError} when a file cannot be written, which leaves every file as it was */
        applyChanges: (changes: AppliedFiles): void => {
          applyChanges({
            changes,
            writes: ports.appliedFiles,
          });
        },
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        planApply: (startFolderPath: AbsolutePath): ProjectRead<ApplyPlan> =>
          planApply(presetsInputOf(ports)(startFolderPath)),
        planRun: planRunOf(ports),
        runCommand: ports.commands.run,
      }),
    ],
  );

const registerCommands = (registration: Registration): void => {
  const { context, ports, program, programInput } = registration;

  /** @throws {TreeError} when git cannot list a tree, or a file it lists cannot be read */
  const checkBlocksIn = (asked: {
    base: PackBase | undefined;
    folderPath: AbsolutePath;
  }): Validation | undefined =>
    checkBlocks({
      ...(asked.base === undefined
        ? {}
        : {
            base: asked.base,
          }),
      files: ports.files,
      folderPath: asked.folderPath,
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
      /**
       * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
       * @throws {ReleaseError} when the release's blocks cannot be listed
       */
      checkConfigurations: (startFolderPath: AbsolutePath): StepReport =>
        configurationsStepOf(checkConfigurations(presetsInputOf(ports)(startFolderPath))),
      checkPresets: (asked): StepReport =>
        presetsStepOf(
          checkPresets({
            ...asked,
            distribution: ports.distribution,
            files: ports.files,
            formats: ports.formats,
            parser: ports.presetFiles,
          }),
        ),
      presetsSkipped: presetsSkippedStep,
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
  const program = new Command(EXECUTABLE_NAME);
  let running: Command | undefined;
  let isFailed = false;
  const presentation = createPresentation({
    accent: input.accent,
    env: input.environment.output,
    /** @throws {UsageError} when the options do not parse */
    flags: () => flagsOf(program.opts()),
    io: input.io,
    isTerminal: input.isTerminal,
    streams: input.streams,
  });
  const errors: ErrorHandler = createErrorHandler({
    isHook: () => running?.parent?.name() === HOOK_GROUP,
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
        registerCommands({
          context: {
            helpExamples,
            io: input.io,
            places: input.places,
            renderer: presentation.renderer,
            setFailed: (): void => {
              isFailed = true;
            },
          },
          ports: portsOf(input),
          program,
          programInput: input,
        });

        await program.parseAsync(args, {
          from: 'user',
        });
        await presentation.close();

        return isFailed ? ExitCode.Failure : ExitCode.Success;
      } catch (error) {
        // Why: the terminal is restored before the failure is written below what was drawn.
        await presentation.close();

        return errors.codeOf(error);
      }
    },
    stop: presentation.close,
  };
};

export { createProgram };
