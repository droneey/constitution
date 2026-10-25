import type { AccentTokens, OutputFlags } from '@droneey/design-cli';
import { Command } from 'commander';

import { createNodeProjectFiles } from '#/adapters/file-system';
import { createGitWorkingTree } from '#/adapters/git';
import { createCheckCommand } from '#/composition/check';
import { createPresetsWiringCheck } from '#/composition/digest/adapters/presets';
import { createProjectSource } from '#/composition/project-source/adapters/project';
import type { Validation } from '#/features/blocks';
import { checkBlocks, createBlocksCheckCommand } from '#/features/blocks';
import { createGitFileTrees } from '#/features/blocks/adapters/git';
import { createJsonManifestParser } from '#/features/blocks/adapters/json';
import {
  createYamlBindingsParser,
  createYamlFrontMatterParser,
} from '#/features/blocks/adapters/yaml';
import type { PartDiagnosis } from '#/features/installation';
import { createDoctorCommand, diagnoseInstallation } from '#/features/installation';
import { createClaudePluginRegistry } from '#/features/installation/adapters/claude-code';
import { createGitHubReleaseFeed } from '#/features/installation/adapters/github';
import { createLefthookGitHooks } from '#/features/installation/adapters/lefthook';
import { createPathProgram } from '#/features/installation/adapters/path';
import type { ConfigurationParser, WiringPlan } from '#/features/presets';
import {
  checkPresets,
  createPresetsCheckCommand,
  createPresetsPlanCommand,
  planPresets,
} from '#/features/presets';
import { createConfigurationParser } from '#/features/presets/adapters/configuration';
import { createConfigFileParser } from '#/features/project/adapters/config-file';
import { createManifestWorkspace } from '#/features/project/adapters/workspace';
import { createYamlBlockCardParser } from '#/features/project/adapters/yaml';
import type {
  Reminder,
  SessionCommandRepository,
  SessionDigest,
  SessionId,
  SessionQueryRepository,
  SessionStart,
  StopEvent,
  StopJudgement,
  WiringCheck,
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
import { createTmpSessionRepository } from '#/features/session/adapters/session-store';
import type { ProjectFiles, ProjectSource, WorkingTree } from '#/kernel/contracts';
import type { ProjectWarning } from '#/kernel/entities';
import { Version } from '#/kernel/value-objects';
import { createHelpLayout } from '#/libs/commander';
import type { CommandContext, CommandIo, CommandPlaces } from '#/shared/cli';
import { OUTPUT_FLAGS, outputFlagsOf } from '#/shared/cli';

import { clockOf } from './configuration';
import type { ErrorHandler } from './error-handler';
import { createErrorHandler } from './error-handler';
import { ExitCode } from './exit-codes';
import type { Streams } from './presentation';
import { createPresentation } from './presentation';

interface ProgramInput {
  readonly accent: AccentTokens;
  readonly environment: {
    /** the folder Claude Code keeps its own files in */
    readonly claudeConfig: string;
    /** the environment git, lefthook and the programs on PATH run in */
    readonly commands: Readonly<Record<string, string>>;
    /** what the environment says of colour, motion and the terminal */
    readonly output: Readonly<Record<string, string | undefined>>;
    /** the plugin's folder, when Claude Code runs a hook from it */
    readonly pluginRoot: string | undefined;
    /** the folder each session keeps its state in */
    readonly sessions: string;
    /** the day the specs fix the clock at, YYYY-MM-DD; absent for the system's clock */
    readonly today?: string;
  };
  readonly fetch: (url: string, init: RequestInit) => Promise<Response>;
  readonly io: CommandIo;
  readonly isTerminal: boolean;
  readonly places: CommandPlaces;
  /** the fingerprint of the plugin's files this program was built with, read when doctor asks */
  readonly pluginFingerprint: () => string | undefined;
  readonly streams: Streams;
  readonly version: string;
}

interface Program {
  readonly run: (args: readonly string[]) => Promise<ExitCode>;
  /** ends whatever is still drawn, as an interrupt asks */
  readonly stop: () => Promise<void>;
}

const NAME = 'constitution';
const HOOK = 'hook';
// The time each outside call may take: a run of git, of a program on PATH, of lefthook, and the
// call that asks GitHub for the latest release.
const GIT_TIMEOUT_MS = 30_000;
const PROGRAM_TIMEOUT_MS = 5000;
const LEFTHOOK_TIMEOUT_MS = 10_000;
const RELEASE_TIMEOUT_MS = 3000;
// The folders the workspace's globs list at most in one look.
const WORKSPACE_FOLDERS = 10_000;

interface Ports {
  readonly configurations: ConfigurationParser;
  readonly files: ProjectFiles;
  readonly sessions: SessionCommandRepository & SessionQueryRepository;
  readonly source: ProjectSource;
  readonly wiring: WiringCheck;
  readonly workingTree: WorkingTree;
}

const portsOf = (input: ProgramInput): Ports => {
  const configurations = createConfigurationParser();
  const files = createNodeProjectFiles();
  const workingTree = createGitWorkingTree({
    env: input.environment.commands,
    timeoutMs: GIT_TIMEOUT_MS,
  });

  return {
    configurations,
    files,
    sessions: createTmpSessionRepository({
      folder: input.environment.sessions,
    }),
    source: createProjectSource({
      cardParser: createYamlBlockCardParser(),
      clock: clockOf(input.environment.today),
      configParser: createConfigFileParser(),
      files,
      workspace: createManifestWorkspace({
        maxFolders: WORKSPACE_FOLDERS,
      }),
    }),
    wiring: createPresetsWiringCheck({
      files,
      parser: configurations,
      workingTree,
    }),
    workingTree,
  };
};

const flagsOf = (opts: unknown): OutputFlags => {
  const { color, motion, plain } = outputFlagsOf(opts);

  return {
    ...(color === undefined
      ? {}
      : {
          colour: color,
        }),
    ...(motion === undefined
      ? {}
      : {
          motion,
        }),
    ...(plain === undefined
      ? {}
      : {
          plain,
        }),
  };
};

// A command added to a parent takes the program's settings first: its output, exits and help.
const adopt = (parent: Command, children: readonly Command[]): Command => {
  for (const child of children) {
    child.copyInheritedSettings(parent);
    parent.addCommand(child);
  }

  return parent;
};

const groupOf = (input: {
  context: CommandContext;
  description: string;
  examples: readonly string[];
  name: string;
  parent: Command;
}): Command =>
  input.context.withExamples(
    new Command(input.name).description(input.description).copyInheritedSettings(input.parent),
    input.examples,
  );

interface Registration {
  readonly context: CommandContext;
  readonly ports: Ports;
  readonly program: Command;
  readonly programInput: ProgramInput;
}

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

const registerCommands = (registration: Registration): void => {
  const { context, ports, program, programInput } = registration;

  const checkBlocksIn = (asked: {
    base: string | undefined;
    folder: string;
  }): Validation | undefined =>
    checkBlocks({
      ...asked,
      bindingsParser: createYamlBindingsParser(),
      files: ports.files,
      frontMatterParser: createYamlFrontMatterParser(),
      manifestParser: createJsonManifestParser(),
      trees: createGitFileTrees({
        env: programInput.environment.commands,
        timeoutMs: GIT_TIMEOUT_MS,
      }),
    });

  const checkPresetsAt = (start: string): readonly ProjectWarning[] | undefined =>
    checkPresets({
      ...ports,
      parser: ports.configurations,
      start,
    });

  adopt(program, [
    createCheckCommand({
      ...context,
      checkBlocks: checkBlocksIn,
      checkPresets: checkPresetsAt,
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
    adopt(
      groupOf({
        context,
        description: "Check and plan the configurations the project's tools take from the presets.",
        examples: [
          'constitution presets check',
          'constitution presets plan',
        ],
        name: 'presets',
        parent: program,
      }),
      [
        createPresetsCheckCommand({
          ...context,
          checkPresets: checkPresetsAt,
        }),
        createPresetsPlanCommand({
          ...context,
          planPresets: (start: string): WiringPlan =>
            planPresets({
              ...ports,
              start,
            }),
        }),
      ],
    ),
    hookCommandsOf(registration),
    doctorCommandOf(registration),
  ]);
};

const createProgram = (input: ProgramInput): Program => {
  const examples = new Map<unknown, readonly string[]>();
  const program = new Command(NAME);
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
    .configureHelp({
      formatHelp: (command, helper) =>
        createHelpLayout({
          examplesOf: (asked: Command) => examples.get(asked) ?? [],
          theme: presentation.theme(),
        }).formatHelp(command, helper),
      showGlobalOptions: true,
    })
    .exitOverride()
    .showSuggestionAfterError(true)
    .hook('preAction', (_program: Command, action: Command): void => {
      running = action;
    });

  for (const flag of OUTPUT_FLAGS) {
    program.option(flag.flags, flag.description);
  }

  examples.set(program, [
    'constitution check',
    'constitution doctor',
    'constitution presets plan',
  ]);
  registerCommands({
    ports: portsOf(input),
    context: {
      io: input.io,
      places: input.places,
      renderer: presentation.renderer,
      setFailed: (): void => {
        isFailed = true;
      },
      withExamples: <TCommand>(command: TCommand, given: readonly string[]): TCommand => {
        examples.set(command, given);

        return command;
      },
    },
    program,
    programInput: input,
  });

  return {
    run: async (args: readonly string[]): Promise<ExitCode> => {
      try {
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

export type { Program, ProgramInput };
export { createProgram };
