import { Command } from 'commander';

import type { PackCheckAsked } from '#/composition/check';
import { createCheckCommand, PACKS_LABEL, packsStepOf } from '#/composition/check';
import {
  createActiveRulesSource,
  createPinnedRelease,
  createProjectReader,
  createRulesSource,
} from '#/composition/project-source/infrastructure/project';
import type { PackBase, Validation } from '#/features/blocks';
import { checkBlocks, createBlocksCheckCommand } from '#/features/blocks';
import { createGitFileTrees } from '#/features/blocks/infrastructure/git';
import { createJsonManifestParser } from '#/features/blocks/infrastructure/json';
import { createYamlFrontMatterParser } from '#/features/blocks/infrastructure/yaml';
import type { PartDiagnosis } from '#/features/installation';
import { createDoctorCommand, diagnoseInstallation } from '#/features/installation';
import { createClaudePluginRegistry } from '#/features/installation/infrastructure/claude-code';
import { createGitHubReleaseFeed } from '#/features/installation/infrastructure/github';
import { createLefthookGitHooks } from '#/features/installation/infrastructure/lefthook';
import { createPathExecutable } from '#/features/installation/infrastructure/path';
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
  ProjectReadStatus,
  planApply,
  planPresets,
  planRun,
  presetsSkippedStep,
  presetsStepOf,
} from '#/features/presets';
import { createConfigurationFormat } from '#/features/presets/infrastructure/configuration';
import {
  createDistributionMapSources,
  createFileAppliedFilesRepository,
  createFileLockQueries,
} from '#/features/presets/infrastructure/file-system';
import { createShellCommandRunner } from '#/features/presets/infrastructure/process';
import { createYamlPresetFileParser } from '#/features/presets/infrastructure/yaml';
import { createJsonReleaseManifestParser } from '#/features/project/infrastructure/json';
import { createManifestWorkspace } from '#/features/project/infrastructure/workspace';
import {
  createYamlBlockCardParser,
  createYamlConfigFileParser,
} from '#/features/project/infrastructure/yaml';
import type { GoverningRules } from '#/features/session';
import { createRulesCommand, readRules } from '#/features/session';
import { createSha256TextHasher } from '#/features/session/infrastructure/crypto';
import { createGitWorkingTree } from '#/features/session/infrastructure/git';
import { readingTextOf } from '#/features/session/infrastructure/session-store';
import { createNodeProjectFiles } from '#/infrastructure/file-system';
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
import { hookCommandsOf } from './hook-commands';
import { createPresentation } from './presentation';
import type { Program, ProgramInput } from './program.types';
import type { Ports, PresetsInput, Registration } from './registration.types';
import { createSessionPorts } from './session-ports';
import { stateFolderWarningText } from './state-folder-warning';

const GIT_TIMEOUT_MS = 30_000;
const EXECUTABLE_TIMEOUT_MS = 5000;
const LEFTHOOK_TIMEOUT_MS = 10_000;
const RELEASE_TIMEOUT_MS = 3000;
const FOLDER_FILES = 10_000;
const WORKSPACE_FOLDERS = 10_000;
const WORKSPACE_GLOBS = 1000;

interface PortsInput {
  /** @throws {UsageError} when the options do not parse */
  readonly isColoured: () => boolean;
  readonly program: ProgramInput;
}

/** @throws {ConfigurationError} when the day is written otherwise than YYYY-MM-DD */
const portsOf = ({ isColoured, program: input }: PortsInput): Ports => {
  const files = createNodeProjectFiles({
    maxFiles: FOLDER_FILES,
  });
  const presetFiles = createYamlPresetFileParser();
  const distribution = createDistributionMapSources({
    builds: PACKAGE_BUILDS,
    mapName: DISTRIBUTION_MAP_NAME,
  });
  const formats = createConfigurationFormat();
  const lockQueries = createFileLockQueries();
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
    activeRules: createActiveRulesSource({
      ...project,
      presetFiles,
    }),
    appliedFilesRepository: createFileAppliedFilesRepository(),
    commands: createShellCommandRunner({
      environment: input.environment.tools,
      isColoured,
      stderr: input.streams.stderr,
      stdout: input.streams.stdout,
    }),
    distribution,
    files,
    formats,
    hasher: createSha256TextHasher(),
    lockQueries,
    pinned: createPinnedRelease(project),
    presetFiles,
    reader: createProjectReader(project),
    rules: createRulesSource({
      presets: {
        distribution,
        formats,
        lockOf: lockQueries.read,
        parser: presetFiles,
      },
      project,
    }),
    ...createSessionPorts({
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
    lockQueries: ports.lockQueries,
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
            appliedFilesRepository: ports.appliedFilesRepository,
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
    lowered?: PackCheckAsked['lowered'];
  }): Validation | undefined =>
    checkBlocks({
      ...(asked.base === undefined
        ? {}
        : {
            base: asked.base,
          }),
      ...(asked.lowered === undefined
        ? {}
        : {
            lowered: asked.lowered,
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
      /**
       * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
       * @throws {ReleaseError} when the release's blocks cannot be listed
       */
      checkPacks: (startFolderPath: AbsolutePath): StepReport | undefined => {
        const read = ports.reader.open(startFolderPath);

        return read.status === ProjectReadStatus.Opened
          ? packsStepOf({
              checkBlocks: checkBlocksIn,
              project: read.answer,
            })
          : undefined;
      },
      packsLabel: PACKS_LABEL,
      planRun: planRunOf(ports),
      runCommand: ports.commands.run,
    }),
    createRulesCommand({
      ...context,
      readRules: (paths: readonly AbsolutePath[]): GoverningRules =>
        readRules({
          hasher: ports.hasher,
          paths,
          source: ports.activeRules,
          workingTree: ports.workingTree,
        }),
      textOf: readingTextOf,
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
          ports: portsOf({
            isColoured: presentation.isColoured,
            program: input,
          }),
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
