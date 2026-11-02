import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import type { HookRun } from '../hook.fixtures';
import { environmentOf, machineVariables, writeFiles } from '../package.fixtures';
import { createPluginRoot, removePluginRoots } from '../plugin-root.fixtures';

const hookShell: string = Bun.which(process.env['HOOK_SHELL'] ?? 'bash') ?? 'bash';
const TIMEOUT_MS = 20_000;
const EXECUTABLE = 'constitution';
const TRUSTED_CONFIGS = 'MISE_TRUSTED_CONFIG_PATHS';
// Why: mise finds its installs and the configs it trusts through these variables as well as through
// its files at home; a CI runner sets them in place of the files.
const MISE_VARIABLES = [
  'HOME',
  'MISE_CACHE_DIR',
  'MISE_CONFIG_DIR',
  'MISE_DATA_DIR',
  'MISE_STATE_DIR',
  'TMPDIR',
  'XDG_CACHE_HOME',
  'XDG_CONFIG_HOME',
  'XDG_DATA_HOME',
  'XDG_STATE_HOME',
] as const;
// Why: what the hook runs besides the executable; a search path of these alone holds no mise.
const HOOK_TOOLS = [
  'cat',
  'dirname',
] as const;
// Why: a stand-in for the executable, which names the arguments it was given and echoes the event
// it read, so a case sees which one ran and what reached it.
const ECHOING = '#!/bin/sh\nprintf \'%s|\' "$0 $*"\ncat\n';
const CRASH = 'crash-of-the-stand-in';
const crashing = `#!/bin/sh\nprintf '%s\\n' '${CRASH}' >&2\nexit 70\n`;
const UNSTARTABLE = '#!/nowhere/interpreter\n';

const folders: string[] = [];

let root = '';

const folderOf = (prefix: string): string => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), prefix)));

  folders.push(folder);

  return folder;
};

const standInIn = (input: { folder: string; script: string }): string => {
  const bin = join(input.folder, 'bin');

  writeFiles({
    files: Object.fromEntries([
      [
        join('bin', EXECUTABLE),
        input.script,
      ],
    ]),
    folder: input.folder,
  });
  chmodSync(join(bin, EXECUTABLE), 0o755);

  return bin;
};

// Why: the folder pins its own executable as this repository does, first on PATH through mise.
const pinningFolder = (script: string): string => {
  const folder = folderOf('constitution-pinned-');

  standInIn({
    folder,
    script,
  });
  writeFiles({
    files: Object.fromEntries([
      [
        'mise.toml',
        '[env]\n_.path = ["{{config_root}}/bin"]\n',
      ],
    ]),
    folder,
  });

  return folder;
};

const searchPathWithoutMise = (standIn: string | undefined): string => {
  const tools = folderOf('constitution-tools-');

  for (const tool of HOOK_TOOLS) {
    symlinkSync(Bun.which(tool) ?? tool, join(tools, tool));
  }

  return [
    tools,
    ...(standIn === undefined
      ? []
      : [
          standIn,
        ]),
  ].join(delimiter);
};

const eventIn = (folder: string): string =>
  JSON.stringify(
    Object.fromEntries([
      [
        'cwd',
        folder,
      ],
      [
        'hook_event_name',
        'PreToolUse',
      ],
      [
        'session_id',
        'session-1',
      ],
      [
        'tool_input',
        Object.fromEntries([
          [
            'command',
            'true',
          ],
        ]),
      ],
      [
        'tool_name',
        'Bash',
      ],
    ]),
  );

const runIn = (input: {
  event: string;
  hookEvent: string;
  searchPath: string;
  trusted: string;
}): HookRun => {
  const run = spawnSync(
    hookShell,
    [
      join(root, 'hooks', 'hook.sh'),
      input.hookEvent,
    ],
    {
      cwd: tmpdir(),
      encoding: 'utf8',
      env: environmentOf(
        new Map([
          ...machineVariables(MISE_VARIABLES),
          [
            'CLAUDE_PLUGIN_ROOT',
            root,
          ],
          [
            'PATH',
            input.searchPath,
          ],
          [
            TRUSTED_CONFIGS,
            [
              input.trusted,
              ...(process.env[TRUSTED_CONFIGS] === undefined
                ? []
                : [
                    process.env[TRUSTED_CONFIGS],
                  ]),
            ].join(delimiter),
          ],
        ]),
      ),
      input: input.event,
      timeout: TIMEOUT_MS,
    },
  );

  return {
    exitCode: run.status ?? undefined,
    stderr: run.stderr,
    stdout: run.stdout,
  };
};

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  for (const folder of folders.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
});

afterAll(() => {
  removePluginRoots();
});

describe('the hook', () => {
  it('should run the executable mise resolves in the folder of the call, the event unchanged, though another comes first on PATH', () => {
    // Arrange
    const folder = pinningFolder(ECHOING);
    const event = eventIn(folder);
    const another = standInIn({
      folder: folderOf('constitution-another-'),
      script: ECHOING,
    });

    // Act
    const run = runIn({
      event,
      hookEvent: 'pre-tool-use',
      searchPath: [
        another,
        process.env['PATH'] ?? '',
      ].join(delimiter),
      trusted: folder,
    });

    // Assert
    expect(run).toStrictEqual<HookRun>({
      exitCode: 0,
      stderr: '',
      stdout: `${join(folder, 'bin', EXECUTABLE)} hook pre-tool-use|${event}`,
    });
  });

  it('should run the executable on PATH when mise is missing', () => {
    // Arrange
    const folder = folderOf('constitution-unpinned-');
    const standIn = standInIn({
      folder,
      script: ECHOING,
    });
    const event = eventIn(folder);

    // Act
    const run = runIn({
      event,
      hookEvent: 'pre-tool-use',
      searchPath: searchPathWithoutMise(standIn),
      trusted: folder,
    });

    // Assert
    expect(run).toStrictEqual<HookRun>({
      exitCode: 0,
      stderr: '',
      stdout: `${join(standIn, EXECUTABLE)} hook pre-tool-use|${event}`,
    });
  });

  it('should say in one line that the executable is missing and exit 0 when no folder of PATH holds it', () => {
    // Arrange
    const folder = folderOf('constitution-missing-');

    // Act
    const run = runIn({
      event: eventIn(folder),
      hookEvent: 'pre-tool-use',
      searchPath: searchPathWithoutMise(undefined),
      trusted: folder,
    });

    // Assert
    expect({
      exitCode: run.exitCode,
      lines: run.stdout.trimEnd().split('\n').length,
      stderr: run.stderr,
    }).toStrictEqual({
      exitCode: 0,
      lines: 1,
      stderr: '',
    });
  });

  it.each([
    {
      condition: 'it crashes',
      isCrashShown: true,
      script: crashing,
    },
    {
      condition: 'it fails to start',
      isCrashShown: false,
      script: UNSTARTABLE,
    },
  ])(
    'should refuse the action with exit code 2 when the executable mise resolves $condition',
    ({ isCrashShown, script }) => {
      // Arrange
      const folder = pinningFolder(script);

      // Act
      const run = runIn({
        event: eventIn(folder),
        hookEvent: 'pre-tool-use',
        searchPath: process.env['PATH'] ?? '',
        trusted: folder,
      });

      // Assert
      expect({
        exitCode: run.exitCode,
        isCrashShown: run.stderr.includes(CRASH),
        stdout: run.stdout,
      }).toStrictEqual({
        exitCode: 2,
        isCrashShown,
        stdout: '',
      });
    },
  );

  it('should end with the exit code of a crash outside an action', () => {
    // Arrange
    const folder = pinningFolder(crashing);

    // Act
    const run = runIn({
      event: eventIn(folder),
      hookEvent: 'post-tool-use',
      searchPath: process.env['PATH'] ?? '',
      trusted: folder,
    });

    // Assert
    expect(run.exitCode).toBe(70);
  });
});
