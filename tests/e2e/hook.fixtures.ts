import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

enum HookEvent {
  Startup = 'startup',
  Resume = 'resume',
  Clear = 'clear',
  Compact = 'compact',
  Subagent = 'subagent',
}

// Folders are relative to the project root.
interface HookCall {
  cwd?: string | undefined;
  event: HookEvent;
  nonUtf8Byte?: boolean | undefined;
  // CLAUDE_PLUGIN_ROOT is unset, though the command still names the root
  pluginRootUnset?: boolean | undefined;
  project: string;
  projectDir?: string | undefined;
  root: string;
  session?: string | undefined;
  // the process starts outside the project, so only the event names cwd
  spawnOutside?: boolean | undefined;
  tmpDir?: string | undefined;
}

interface HookRun {
  exitCode: number | undefined;
  stderr: string;
  stdout: string;
}

interface HookOutput {
  context: string;
  event: string;
}

// The macOS job sets HOOK_SHELL=/bin/bash to run the hook under bash 3.2.
const SHELL: string = process.env['HOOK_SHELL'] ?? 'bash';
const WARNINGS = '⚠️ Warnings';
// A session carries the user's locale; the hook must not depend on it.
const LOCALE = 'en_US.UTF-8';
const PLACEHOLDER = '@';
const NOT_UTF8 = 0xe9;
// A hook that blocks, on a named pipe say, fails its case instead of the run.
const TIMEOUT_MS = 20_000;
// The day the hook's `date` prints: the spec never reads the real clock.
const HOOK_TODAY = '2026-06-15';
const EXECUTABLE = 0o755;

// Claude Code names the event's fields in snake case.
const eventOf = (input: {
  cwd: string;
  event: HookEvent;
  session: string | undefined;
}): Readonly<Record<string, string>> =>
  Object.fromEntries([
    [
      'session_id',
      input.session ?? `session-${PLACEHOLDER}`,
    ],
    [
      'transcript_path',
      '/transcripts/session-1.jsonl',
    ],
    [
      'cwd',
      input.cwd,
    ],
    ...(input.event === HookEvent.Subagent
      ? [
          [
            'hook_event_name',
            'SubagentStart',
          ],
          [
            'agent_id',
            'agent-1',
          ],
          [
            'agent_type',
            'Explore',
          ],
        ]
      : [
          [
            'hook_event_name',
            'SessionStart',
          ],
          [
            'source',
            input.event,
          ],
        ]),
  ]);

const inputOf = (input: {
  cwd: string;
  event: HookEvent;
  nonUtf8Byte: boolean;
  session: string | undefined;
}): Buffer => {
  const bytes = Buffer.from(JSON.stringify(eventOf(input)));
  const placeholder = bytes.indexOf(PLACEHOLDER);

  if (placeholder >= 0) {
    bytes[placeholder] = input.nonUtf8Byte
      ? NOT_UTF8
      : PLACEHOLDER.charCodeAt(0);
  }

  return bytes;
};

// A `date` of the test's own, first on the hook's PATH, in a folder of its own:
// the plugin root may be this repository, which a spec never writes to.
const createFakeClock = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-clock-'));
  const date = join(folder, 'date');

  writeFileSync(date, `#!/bin/sh\necho ${HOOK_TODAY}\n`);
  chmodSync(date, EXECUTABLE);

  return folder;
};

// A clean environment: the session that runs the tests sets CLAUDE_PROJECT_DIR
// and CLAUDE_PLUGIN_ROOT of its own.
const runHook = (call: HookCall): HookRun => {
  const cwd = join(call.project, call.cwd ?? '');
  const clock = createFakeClock();
  const hookRun = spawnSync(
    SHELL,
    [
      join(call.root, 'hooks', 'session-start.sh'),
    ],
    {
      cwd: call.spawnOutside !== true && existsSync(cwd) ? cwd : tmpdir(),
      encoding: 'utf8',
      timeout: TIMEOUT_MS,
      env: Object.fromEntries([
        [
          'PATH',
          `${clock}:${process.env['PATH'] ?? ''}`,
        ],
        [
          'LANG',
          LOCALE,
        ],
        [
          'LC_ALL',
          LOCALE,
        ],
        ...(call.pluginRootUnset === true
          ? []
          : [
              [
                'CLAUDE_PLUGIN_ROOT',
                call.root,
              ],
            ]),
        ...(call.projectDir === undefined
          ? []
          : [
              [
                'CLAUDE_PROJECT_DIR',
                join(call.project, call.projectDir),
              ],
            ]),
        ...(call.tmpDir === undefined
          ? []
          : [
              [
                'TMPDIR',
                call.tmpDir,
              ],
            ]),
      ]),
      input: inputOf({
        cwd,
        event: call.event,
        nonUtf8Byte: call.nonUtf8Byte === true,
        session: call.session,
      }),
    },
  );

  rmSync(clock, {
    force: true,
    recursive: true,
  });

  return {
    exitCode: hookRun.status ?? undefined,
    stderr: hookRun.stderr,
    stdout: hookRun.stdout,
  };
};

const isRecord = (parsed: unknown): parsed is Record<string, unknown> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

// JSON.parse refuses a second object, so a parse proves there is exactly one.
const outputOf = (run: HookRun): HookOutput => {
  const parsed: unknown = JSON.parse(run.stdout);
  const inner = isRecord(parsed) ? parsed['hookSpecificOutput'] : undefined;

  if (
    !isRecord(parsed) ||
    Object.keys(parsed).length !== 1 ||
    !isRecord(inner) ||
    Object.keys(inner).length !== 2 ||
    typeof inner['additionalContext'] !== 'string' ||
    typeof inner['hookEventName'] !== 'string'
  ) {
    throw new Error(
      `The hook printed no hookSpecificOutput object: ${run.stdout}`,
    );
  }

  return {
    context: inner['additionalContext'],
    event: inner['hookEventName'],
  };
};

const contextOf = (run: HookRun): string => outputOf(run).context;

const linesOf = (context: string): readonly string[] =>
  context.replace(/\n$/, '').split('\n');

const headerOf = (context: string): readonly string[] =>
  linesOf(context.slice(0, context.indexOf('\n\n')));

const factsOf = (context: string): readonly string[] =>
  headerOf(context).slice(1);

const blockListOf = (context: string): readonly string[] => {
  const lines = linesOf(context);
  const start = lines.findIndex((line) => line.startsWith("Core's files")) + 2;

  return lines.slice(start, lines.indexOf('', start));
};

const HEADLINES = '## MUST headlines';

const headlinesOf = (context: string): readonly string[] => {
  const lines = linesOf(context);
  const start = lines.indexOf(HEADLINES);

  if (start === -1) {
    return [];
  }

  const end = lines.indexOf('', start);

  return lines.slice(start + 1, end === -1 ? undefined : end);
};

const coreLinesOf = (context: string): readonly string[] =>
  linesOf(context).filter((line) => line.startsWith("Core's files"));

const headlineOf = (input: { context: string; slug: string }): string =>
  linesOf(input.context).find((line) => line.startsWith(`- ${input.slug} `)) ??
  '';

const warningsOf = (context: string): readonly string[] => {
  const lines = linesOf(context);
  const start = lines.findIndex((line) => line.startsWith(WARNINGS));

  if (start === -1) {
    return [];
  }

  const end = lines.indexOf('', start);

  return lines.slice(start, end === -1 ? undefined : end);
};

const bytesAfterHeader = (context: string): number =>
  Buffer.byteLength(context.slice(context.indexOf('\n\n') + 2));

const lastLinesOf = (input: {
  context: string;
  count: number;
}): readonly string[] => linesOf(input.context).slice(-input.count);

const runScript = (call: {
  event: Readonly<Record<string, unknown>>;
  root: string;
  script: string;
  tmpDir: string;
}): HookRun => {
  const hookRun = spawnSync(
    SHELL,
    [
      join(call.root, 'hooks', call.script),
    ],
    {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: TIMEOUT_MS,
      env: Object.fromEntries([
        [
          'CLAUDE_PLUGIN_ROOT',
          call.root,
        ],
        [
          'LANG',
          LOCALE,
        ],
        [
          'LC_ALL',
          LOCALE,
        ],
        [
          'PATH',
          process.env['PATH'] ?? '',
        ],
        [
          'TMPDIR',
          call.tmpDir,
        ],
      ]),
      input: JSON.stringify(call.event),
    },
  );

  return {
    exitCode: hookRun.status ?? undefined,
    stderr: hookRun.stderr,
    stdout: hookRun.stdout,
  };
};

export type { HookRun };
export {
  blockListOf,
  bytesAfterHeader,
  contextOf,
  coreLinesOf,
  factsOf,
  HOOK_TODAY,
  HookEvent,
  headlineOf,
  headlinesOf,
  lastLinesOf,
  outputOf,
  runHook,
  runScript,
  warningsOf,
};
