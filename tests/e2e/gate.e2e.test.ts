import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import type { HookRun } from './hook.fixtures';
import { HookEvent, runHook, runScript } from './hook.fixtures';
import { createPluginRoot, removePluginRoots } from './plugin-root.fixtures';
import { configOf, createProject, removeProjects } from './project.fixtures';

enum StopEvent {
  Stop = 'Stop',
  Subagent = 'SubagentStop',
}

interface Session {
  project: string;
  tmpDir: string;
}

const SESSION = 'session-1';
const CHECK = 'bun run check';
const BLOCKED = JSON.stringify({
  decision: 'block',
  reason:
    "The tree changed since the check last passed. Run the project's check, `bun run check`, and hand back only when it passes.",
});
const REVIEW = JSON.stringify({
  systemMessage:
    'Changed files fall under ui; /check edits reviews them against the rules.',
});

let root = '';
const tmpDirs: string[] = [];

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
    },
  );
};

const startSession = (config: string): Session => {
  const project = realpathSync(
    createProject({
      config,
    }),
  );
  const tmpDir = mkdtempSync(join(tmpdir(), 'constitution-state-'));

  tmpDirs.push(tmpDir);
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
    session: SESSION,
    tmpDir,
  });

  return {
    project,
    tmpDir,
  };
};

const write = (input: { path: string; project: string }): void => {
  mkdirSync(dirname(join(input.project, input.path)), {
    recursive: true,
  });
  writeFileSync(join(input.project, input.path), 'export {};\n');
};

const fire = (input: {
  event: string;
  fields?: Readonly<Record<string, string>>;
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
        SESSION,
      ],
      ...Object.entries(input.fields ?? {}),
    ]),
    root,
    script: input.script,
    tmpDir: input.session.tmpDir,
  });

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
  event?: StopEvent;
  session: Session;
}): string =>
  fire({
    event: input.event ?? StopEvent.Stop,
    fields: Object.fromEntries([
      [
        'stop_hook_active',
        input.active === true ? 'true' : 'false',
      ],
    ]),
    script: 'stop.sh',
    session: input.session,
  }).stdout.trim();

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();

  for (const folder of tmpDirs.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
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
    expect(output).toBe('');
  });

  it('should block once and then ask for a review when files changed and the check did not run', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      project: session.project,
    });

    // Act
    const outputs = [
      stop({
        session,
      }),
      stop({
        session,
      }),
    ];

    // Assert
    expect(outputs).toStrictEqual([
      BLOCKED,
      REVIEW,
    ]);
  });

  it('should let the agent stop when the check passed on the changed tree', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
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
    expect(output).toBe('');
  });

  it('should block again when the tree changed after the check passed', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });
    ran({
      command: CHECK,
      session,
    });
    write({
      path: 'src/other.ts',
      project: session.project,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toBe(BLOCKED);
  });

  it.each([
    'bun run lint',
    'bun run checkout',
    'echo bun run check',
  ])('should block when the command run was %s, not the check', (command) => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
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
    expect(output).toBe(BLOCKED);
  });

  it('should only ask for a review when check is null', () => {
    // Arrange
    const session = startSession(
      configOf({
        check: 'null',
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      project: session.project,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toBe(REVIEW);
  });

  it('should say nothing about a review when no active block governs the changed files', () => {
    // Arrange
    const session = startSession(
      configOf({
        check: 'null',
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toBe('');
  });

  it('should let a subagent stop without asking for a review when the check passed', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      project: session.project,
    });
    ran({
      command: CHECK,
      session,
    });

    // Act
    const output = stop({
      event: StopEvent.Subagent,
      session,
    });

    // Assert
    expect(output).toBe('');
  });

  it('should let the agent stop when a block of this hook is being answered', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });

    // Act
    const output = stop({
      active: true,
      session,
    });

    // Assert
    expect(output).toBe('');
  });

  it('should stay quiet when the session saved no state', () => {
    // Arrange
    const session = startSession(configOf({}));

    write({
      path: 'src/main.ts',
      project: session.project,
    });

    // Act
    const output = runScript({
      event: Object.fromEntries([
        [
          'hook_event_name',
          'Stop',
        ],
        [
          'session_id',
          'session-2',
        ],
      ]),
      root,
      script: 'stop.sh',
      tmpDir: session.tmpDir,
    }).stdout;

    // Assert
    expect(output).toBe('');
  });
});
