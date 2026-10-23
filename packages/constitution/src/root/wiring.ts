import type { CLI, Group } from '@bunli/core';
import { createCLI, defineGroup } from '@bunli/core';

import type {
  Clock,
  CommandIo,
  CommandPlaces,
  CommandRun,
  ConfigParser,
  FrontMatterParser,
  ProjectFiles,
  SessionCommandRepository,
  SessionQueryRepository,
  WorkingTree,
} from '#/features/constitution';
import {
  addReminded,
  checkProject,
  createCheckCommand,
  createPlanWiringCommand,
  createPostToolUseCommand,
  createRecordCheckCommand,
  createSessionStartCommand,
  createStopCommand,
  createUserPromptSubmitCommand,
  digestSession,
  fingerprintSession,
  judgeCheckRun,
  judgeStop,
  planProjectWiring,
  recordMark,
  remindFile,
  saveSession,
  validateConstitution,
} from '#/features/constitution';
import { createSystemClock } from '#/features/constitution/adapters/clock';
import { createConfigFileParser } from '#/features/constitution/adapters/config-file';
import {
  createNodeBaseTree,
  createNodeFileSystem,
  createNodeProjectFiles,
  repositoryRootOf,
} from '#/features/constitution/adapters/file-system';
import { createGitWorkingTree } from '#/features/constitution/adapters/git';
import { createJsonManifestParser } from '#/features/constitution/adapters/json';
import { createTmpSessionRepositories } from '#/features/constitution/adapters/session-store';
import {
  createYamlBindingsParser,
  createYamlFrontMatterParser,
  createYamlVocabularyParser,
} from '#/features/constitution/adapters/yaml';

import type { ErrorHandler } from './error-handler';
import { createErrorHandler } from './error-handler';
import { ExitCode } from './exit-codes';

// What the entry hands the root: the environment it read, the streams of the run, and the
// terminal bunli draws on, which a spec replaces.
interface ProgramInput {
  readonly environment: {
    // the environment git runs in
    readonly git: Readonly<Record<string, string>>;
    // the folder each session keeps its state in
    readonly sessions: string;
  };
  readonly io: CommandIo;
  readonly places: CommandPlaces;
  readonly setExitCode: (code: ExitCode) => void;
  readonly terminal?: Parameters<typeof createCLI>[1];
  readonly version: string;
}

interface Program {
  readonly cli: CLI;
  readonly errors: ErrorHandler;
}

const BLOCKS = 'blocks';
// A folder that holds no bunli.config.* nor .bunli/: the root of the file system.
const NEUTRAL_FOLDER = '/';

// bunli merges a bunli.config.* and imports a .bunli/commands.gen.ts it finds in the folder the
// program starts in, and offers no option to stop it; the program runs inside its users' projects,
// so it builds the command line from a folder that holds neither, and the configuration given here
// is the whole of it.
const createInlineCli = async (input: {
  terminal: ProgramInput['terminal'];
  version: string;
}): Promise<CLI> => {
  const started = process.cwd();

  process.chdir(NEUTRAL_FOLDER);

  try {
    return await createCLI(
      {
        description:
          'The rules a repository is built by: checks a Constitution, a project, and serves the hooks.',
        name: 'constitution',
        version: input.version,
      },
      input.terminal,
    );
  } finally {
    process.chdir(started);
  }
};

interface Ports {
  readonly clock: Clock;
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly frontMatterParser: FrontMatterParser;
  readonly sessions: {
    readonly commands: SessionCommandRepository;
    readonly queries: SessionQueryRepository;
  };
  readonly workingTree: WorkingTree;
}

const portsOf = (input: ProgramInput): Ports => ({
  clock: createSystemClock(),
  configParser: createConfigFileParser(),
  files: createNodeProjectFiles(),
  frontMatterParser: createYamlFrontMatterParser(),
  sessions: createTmpSessionRepositories({
    folder: input.environment.sessions,
  }),
  workingTree: createGitWorkingTree({
    env: input.environment.git,
  }),
});

// The commands a person or a pipeline runs: check and wiring.
const registerPersonCommands = (input: { cli: CLI; ports: Ports; run: CommandRun }): void => {
  const { ports, run } = input;

  input.cli.command(
    createCheckCommand({
      ...run,
      checkProject: (start: string) =>
        checkProject({
          ...ports,
          start,
        }),
      holdsBlocks: (folder: string): boolean => ports.files.isFolder(`${folder}/${BLOCKS}`),
      validateConstitution: (checked: { base: string | undefined; root: string }) =>
        validateConstitution({
          ...(checked.base === undefined
            ? {}
            : {
                base: createNodeBaseTree({
                  root: checked.base,
                }),
              }),
          bindingsParser: createYamlBindingsParser(),
          frontMatterParser: ports.frontMatterParser,
          manifestParser: createJsonManifestParser(),
          repository: createNodeFileSystem({
            root: repositoryRootOf(checked.root),
          }),
          tree: createNodeFileSystem({
            root: checked.root,
          }),
          vocabularyParser: createYamlVocabularyParser(),
        }),
    }),
  );
  input.cli.command(
    createPlanWiringCommand({
      ...run,
      planWiring: (start: string) =>
        planProjectWiring({
          ...ports,
          start,
        }),
    }),
  );
};

// One subcommand of hook for each of Claude Code's events the plugin answers.
const hookGroupOf = (input: { ports: Ports; run: CommandRun }): Group => {
  const { ports, run } = input;
  const { sessions, workingTree } = ports;
  const marks = {
    recordMark: (mark: Omit<Parameters<typeof recordMark>[0], 'sessions'>): void => {
      recordMark({
        ...mark,
        sessions: sessions.commands,
      });
    },
  };

  return defineGroup({
    commands: [
      createSessionStartCommand({
        ...run,
        digestSession: (start) =>
          digestSession({
            ...ports,
            ...start,
          }),
        saveSession: (save) => {
          saveSession({
            ...save,
            sessions: sessions.commands,
          });
        },
      }),
      createPostToolUseCommand({
        ...run,
        addReminded: (added) => {
          addReminded({
            ...added,
            sessions: sessions.commands,
          });
        },
        remindFile: (asked) =>
          remindFile({
            ...asked,
            sessions: sessions.queries,
          }),
      }),
      createUserPromptSubmitCommand({
        ...run,
        ...marks,
        fingerprintSession: (session: string) =>
          fingerprintSession({
            session,
            sessions: sessions.queries,
            workingTree,
          })?.fingerprint,
      }),
      createRecordCheckCommand({
        ...run,
        ...marks,
        judgeCheckRun: (asked) =>
          judgeCheckRun({
            ...asked,
            sessions: sessions.queries,
            workingTree,
          }),
      }),
      createStopCommand({
        ...run,
        ...marks,
        judgeStop: (event) =>
          judgeStop({
            ...event,
            sessions: sessions.queries,
            workingTree,
          }),
      }),
    ],
    description: "Serve one of Claude Code's hooks, the event read from standard input",
    name: 'hook',
  });
};

const createProgram = async (input: ProgramInput): Promise<Program> => {
  const ports = portsOf(input);
  const errors = createErrorHandler({
    setExitCode: input.setExitCode,
    writeError: input.io.writeError,
  });
  const run: CommandRun = {
    io: input.io,
    places: input.places,
    run: errors.run,
    setFailed: (): void => {
      input.setExitCode(ExitCode.Failure);
    },
  };
  const cli = await createInlineCli({
    terminal: input.terminal,
    version: input.version,
  });

  registerPersonCommands({
    cli,
    ports,
    run,
  });
  cli.command(
    hookGroupOf({
      ports,
      run,
    }),
  );

  return {
    cli,
    errors,
  };
};

export type { Program, ProgramInput };
export { createProgram };
