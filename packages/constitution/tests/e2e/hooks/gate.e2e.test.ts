import { execFileSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import type { HookRun } from '../hook.fixtures';
import {
  HookEvent,
  isRecord,
  mentionedOf,
  newSession,
  removeSessions,
  runHook,
  runScript,
} from '../hook.fixtures';
import { toolEnvironment } from '../package.fixtures';
import { createPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { configOf, createProject, Repository, removeProjects } from '../project.fixtures';

enum StopEvent {
  Stop = 'Stop',
  Subagent = 'SubagentStop',
}

interface Session {
  id: string;
  project: string;
}

const CHECK = 'constitution run check';
const REVIEW_COMMAND = '/check';
const NOTHING: readonly string[] = [] as const;
const BLOCKED: readonly string[] = [
  'block',
  CHECK,
] as const;
const HELD_FOR_BOTH: readonly string[] = [
  'block',
  CHECK,
  REVIEW_COMMAND,
  'ui',
] as const;
const HELD_FOR_REVIEW: readonly string[] = [
  'block',
  REVIEW_COMMAND,
  'ui',
] as const;
const TOLD: readonly string[] = [
  'told',
] as const;

const gateOf = (stdout: string): readonly string[] => {
  const parsed: unknown = stdout === '' ? {} : JSON.parse(stdout);
  const { decision, reason, systemMessage } = isRecord(parsed) ? parsed : {};

  if (typeof decision === 'string') {
    return [
      decision,
      ...mentionedOf({
        names: [
          CHECK,
          REVIEW_COMMAND,
          'ui',
        ],
        text: String(reason),
      }),
    ];
  }

  return typeof systemMessage === 'string' ? TOLD : NOTHING;
};

let root = '';

const git = (input: { args: readonly string[]; project: string }): void => {
  execFileSync(
    'git',
    [
      '-c',
      'user.name=test',
      '-c',
      'user.email=test@example.com',
      ...input.args,
    ],
    {
      cwd: input.project,
      env: toolEnvironment(),
    },
  );
};

const startSession = (config: string): Session => {
  const project = realpathSync(
    createProject({
      config,
    }),
  );
  const id = newSession();

  git({
    args: [
      'add',
      '.',
    ],
    project,
  });
  git({
    args: [
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'base',
    ],
    project,
  });
  runHook({
    event: HookEvent.Startup,
    project,
    root,
    session: id,
  });

  return {
    id,
    project,
  };
};

const writeFile = (input: { path: string; project: string }): void => {
  mkdirSync(dirname(join(input.project, input.path)), {
    recursive: true,
  });
  writeFileSync(join(input.project, input.path), 'export {};\n');
};

const fire = (input: {
  event: string;
  fields?: Readonly<Record<string, unknown>>;
  script: string;
  session: Session;
}): HookRun =>
  runScript({
    event: Object.fromEntries([
      [
        'hook_event_name',
        input.event,
      ],
      [
        'session_id',
        input.session.id,
      ],
      ...Object.entries(input.fields ?? {}),
    ]),
    root,
    script: input.script,
  });

const write = (input: { agent?: string; path: string; session: Session }): void => {
  writeFile({
    path: input.path,
    project: input.session.project,
  });
  fire({
    event: 'PostToolUse',
    fields: Object.fromEntries([
      ...(input.agent === undefined
        ? []
        : [
            [
              'agent_id',
              input.agent,
            ],
          ]),
      [
        'tool_name',
        'Write',
      ],
      [
        'tool_input',
        Object.fromEntries([
          [
            'file_path',
            join(input.session.project, input.path),
          ],
        ]),
      ],
    ]),
    script: 'post-tool-use.sh',
    session: input.session,
  });
};

const prompt = (session: Session): HookRun =>
  fire({
    event: 'UserPromptSubmit',
    script: 'user-prompt-submit.sh',
    session,
  });

const ran = (input: { command: string; session: Session }): HookRun =>
  fire({
    event: 'PostToolUse',
    fields: Object.fromEntries([
      [
        'tool_name',
        'Bash',
      ],
      [
        'tool_input',
        Object.fromEntries([
          [
            'command',
            input.command,
          ],
        ]),
      ],
    ]),
    script: 'record-check.sh',
    session: input.session,
  });

const stop = (input: {
  active?: boolean;
  agent?: string;
  event?: StopEvent;
  session: Session;
}): readonly string[] =>
  gateOf(
    fire({
      event: input.event ?? StopEvent.Stop,
      fields: Object.fromEntries([
        [
          'stop_hook_active',
          input.active === true,
        ],
        ...(input.agent === undefined
          ? []
          : [
              [
                'agent_id',
                input.agent,
              ],
            ]),
      ]),
      script: 'stop.sh',
      session: input.session,
    }).stdout.trim(),
  );

const reviewerStopOf = (session: Session): readonly string[] =>
  gateOf(
    fire({
      event: StopEvent.Subagent,
      fields: Object.fromEntries([
        [
          'agent_id',
          'reviewer-1',
        ],
        [
          'agent_type',
          'constitution:reviewer',
        ],
      ]),
      script: 'stop.sh',
      session,
    }).stdout.trim(),
  );

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

describe('the hand-back gate', () => {
  it('should let the agent stop when nothing changed', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should hold the hand-back for the check and the review three times, then let it through and say so', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      session,
    });

    // Act
    const first = stop({
      session,
    });

    // Assert
    expect(first).toStrictEqual(HELD_FOR_BOTH);

    // Act
    const second = stop({
      session,
    });

    // Assert
    expect(second).toStrictEqual(HELD_FOR_BOTH);

    // Act
    const third = stop({
      session,
    });

    // Assert
    expect(third).toStrictEqual(HELD_FOR_BOTH);

    // Act
    const fourth = stop({
      session,
    });

    // Assert
    expect(fourth).toStrictEqual(TOLD);
  });

  it('should let the agent stop when the check passed on the changed tree', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      session,
    });
    ran({
      command: `${CHECK} && echo done`,
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should block again when the tree changed after the check passed', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      session,
    });
    ran({
      command: CHECK,
      session,
    });
    write({
      path: 'src/other.ts',
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(BLOCKED);
  });

  it.each([
    'constitution run checkout',
    'echo constitution run check',
  ])('should block when the command run was %s, not the check', (command) => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      session,
    });
    ran({
      command,
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(BLOCKED);
  });

  it('should say nothing about a review when no active block governs the changed files', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/main.ts',
      session,
    });
    ran({
      command: CHECK,
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should not ask for a review when the reviewer reviewed the changed tree', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      session,
    });
    ran({
      command: CHECK,
      session,
    });
    reviewerStopOf(session);

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should let a subagent that passed the check stop, then hold the coordinator for the review of its work until it is recorded', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      agent: 'agent-1',
      path: 'src/features/orders/ui/order-card.tsx',
      session,
    });
    ran({
      command: CHECK,
      session,
    });

    // Act
    const subagentStop = stop({
      agent: 'agent-1',
      event: StopEvent.Subagent,
      session,
    });

    // Assert
    expect(subagentStop).toStrictEqual(NOTHING);

    // Act
    const held = stop({
      session,
    });

    // Assert
    expect(held).toStrictEqual(HELD_FOR_REVIEW);

    // Act
    const reviewerStop = reviewerStopOf(session);

    // Assert
    expect(reviewerStop).toStrictEqual(NOTHING);

    // Act
    const reviewed = stop({
      session,
    });

    // Assert
    expect(reviewed).toStrictEqual(NOTHING);
  });

  it('should let the agent stop when a block of this hook is being answered', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      session,
    });

    // Act
    const output = stop({
      active: true,
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should say nothing at any stop when the project lies in no repository', () => {
    // Arrange
    const project = realpathSync(
      createProject({
        config: configOf({}),
        repository: Repository.None,
      }),
    );
    const session = {
      id: newSession(),
      project,
    };

    runHook({
      event: HookEvent.Startup,
      project,
      root,
      session: session.id,
    });
    prompt(session);
    writeFile({
      path: 'src/main.ts',
      project,
    });

    // Act
    const subagent = fire({
      event: StopEvent.Subagent,
      script: 'stop.sh',
      session,
    });

    // Assert
    expect(subagent.stdout).toBe('');

    // Act
    const main = fire({
      event: StopEvent.Stop,
      script: 'stop.sh',
      session,
    });

    // Assert
    expect(main.stdout).toBe('');
  });

  it('should not hold the main session for files only a subagent changed', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      agent: 'agent-1',
      path: 'src/features/orders/ui/order-card.tsx',
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should hold a subagent with its own changes for the check alone, and let its second stop in a row through', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      agent: 'agent-1',
      path: 'src/features/orders/ui/order-card.tsx',
      session,
    });

    // Act
    const first = stop({
      agent: 'agent-1',
      event: StopEvent.Subagent,
      session,
    });

    // Assert
    expect(first).toStrictEqual(BLOCKED);

    // Act
    const second = stop({
      active: true,
      agent: 'agent-1',
      event: StopEvent.Subagent,
      session,
    });

    // Assert
    expect(second).toStrictEqual(NOTHING);
  });

  it('should hold the main session with its own changes until both the check and the review are recorded', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      session,
    });

    // Act
    const before = stop({
      session,
    });

    // Assert
    expect(before).toStrictEqual(HELD_FOR_BOTH);

    // Act
    const check = ran({
      command: CHECK,
      session,
    });

    // Assert
    expect(check.stdout).toBe('');

    // Act
    const checked = stop({
      session,
    });

    // Assert
    expect(checked).toStrictEqual(HELD_FOR_REVIEW);

    // Act
    const reviewerStop = reviewerStopOf(session);

    // Assert
    expect(reviewerStop).toStrictEqual(NOTHING);

    // Act
    const reviewed = stop({
      session,
    });

    // Assert
    expect(reviewed).toStrictEqual(NOTHING);
  });
});
