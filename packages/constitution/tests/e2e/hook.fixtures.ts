import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { cliFolder } from './cli.fixtures';
import { environmentOf } from './package.fixtures';
import { distributionOf, linkDistribution } from './plugin-root.fixtures';

enum HookEvent {
  Startup = 'startup',
  Resume = 'resume',
  Clear = 'clear',
  Compact = 'compact',
  Subagent = 'subagent',
}

interface HookCall {
  cwd?: string | undefined;
  distribution?: string | undefined;
  event: HookEvent;
  nonUtf8Byte?: boolean | undefined;
  pluginRootUnset?: boolean | undefined;
  project: string;
  projectDir?: string | undefined;
  root: string;
  session?: string | undefined;
  spawnOutside?: boolean | undefined;
  stateHomeUnset?: boolean | undefined;
  unlinked?: boolean | undefined;
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

// Why: CI's macOS entry of the hooks matrix sets HOOK_SHELL=/bin/bash to run the hook under bash
// 3.2.
const shell: string = process.env['HOOK_SHELL'] ?? 'bash';
const WARNINGS = '⚠️ Warnings';
// Why: a session carries the user's locale; the hook must not depend on it.
const LOCALE = 'en_US.UTF-8';
const PLACEHOLDER = '@';
const NOT_UTF8 = 0xe9;
// Why: a hook that blocks, on a named pipe say, fails its own case instead of the whole run.
const TIMEOUT_MS = 20_000;
const HOOK_TODAY = '2026-06-15';
const TODAY_VARIABLE = 'CONSTITUTION_TODAY';
const HOOK = 'hook.sh';
const STATE_HOME_VARIABLE = 'XDG_STATE_HOME';

// Why: the state home of every hook the specs run is this process's own, so none writes into the
// user's.
const stateHome = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-state-')));

process.once('exit', () => {
  rmSync(stateHome, {
    force: true,
    recursive: true,
  });
});

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
    bytes[placeholder] = input.nonUtf8Byte ? NOT_UTF8 : PLACEHOLDER.charCodeAt(0);
  }

  return bytes;
};

// Why: the session that runs the tests sets CLAUDE_PROJECT_DIR and CLAUDE_PLUGIN_ROOT of its own.
const runHook = (call: HookCall): HookRun => {
  const cwd = join(call.project, call.cwd ?? '');

  if (call.unlinked !== true) {
    linkDistribution({
      distribution: call.distribution ?? distributionOf(call.root),
      project: call.project,
    });
  }

  const hookRun = spawnSync(
    shell,
    [
      join(call.root, 'hooks', HOOK),
      'session-start',
    ],
    {
      cwd: call.spawnOutside !== true && existsSync(cwd) ? cwd : tmpdir(),
      encoding: 'utf8',
      timeout: TIMEOUT_MS,
      env: environmentOf(
        new Map([
          [
            'PATH',
            `${cliFolder}:${process.env['PATH'] ?? ''}`,
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
            TODAY_VARIABLE,
            HOOK_TODAY,
          ],
          ...(call.stateHomeUnset === true
            ? []
            : [
                [
                  STATE_HOME_VARIABLE,
                  stateHome,
                ] as const,
              ]),
          ...(call.pluginRootUnset === true
            ? []
            : [
                [
                  'CLAUDE_PLUGIN_ROOT',
                  call.root,
                ] as const,
              ]),
          ...(call.projectDir === undefined
            ? []
            : [
                [
                  'CLAUDE_PROJECT_DIR',
                  join(call.project, call.projectDir),
                ] as const,
              ]),
        ]),
      ),
      input: inputOf({
        cwd,
        event: call.event,
        nonUtf8Byte: call.nonUtf8Byte === true,
        session: call.session,
      }),
    },
  );

  return {
    exitCode: hookRun.status ?? undefined,
    stderr: hookRun.stderr,
    stdout: hookRun.stdout,
  };
};

const isRecord = (parsed: unknown): parsed is Record<string, unknown> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

// Why: JSON.parse refuses a second object, so a parse that succeeds proves there is exactly one.
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
    throw new Error(`The hook printed no hookSpecificOutput object: ${run.stdout}`);
  }

  return {
    context: inner['additionalContext'],
    event: inner['hookEventName'],
  };
};

const contextOf = (run: HookRun): string => outputOf(run).context;

const linesOf = (context: string): readonly string[] => context.replace(/\n$/, '').split('\n');

// Why: the digest is read by its marks, a list item's "- " and a heading's "## ", and by the names
// it gives, never by its wording: a sentence reworded breaks no case.
const ITEM = '- ';
const HEADING = '## ';
const NOTE = /^\d/u;

const NAME_CHARACTER = /[\w./-]/u;

const isMentioned = (input: { name: string; text: string }): boolean => {
  const { name, text } = input;

  for (let at = text.indexOf(name); at !== -1; at = text.indexOf(name, at + 1)) {
    const after = at + name.length;
    const isBorderedAfter =
      !NAME_CHARACTER.test(text.charAt(after)) ||
      (text.charAt(after) === '.' && !NAME_CHARACTER.test(text.charAt(after + 1)));

    if (!NAME_CHARACTER.test(text.charAt(at - 1)) && isBorderedAfter) {
      return true;
    }
  }

  return false;
};

interface MentionedInput {
  readonly names: readonly string[];
  readonly text: string;
}

const mentionedOf = (input: MentionedInput): readonly string[] =>
  input.names.filter((name) =>
    isMentioned({
      name,
      text: input.text,
    }),
  );

const numberIn = (line: string): number => Number(/\d+/u.exec(line)?.[0] ?? 0);

const headerOf = (context: string): readonly string[] =>
  linesOf(context.slice(0, context.indexOf('\n\n')));

const factNumberOf = (context: string): number => numberIn(headerOf(context)[1] ?? '');

const blockListOf = (context: string): readonly string[] => {
  const lines = linesOf(context);
  const list = lines.slice(lines.lastIndexOf('') + 1);
  const [first = ''] = list;

  return first.startsWith(HEADING) || (list.length === 1 && NOTE.test(first)) ? list : [];
};

const ALSO = 'Also: ';

const GROUP = /\([^()]*\)/gu;
const LAST_GROUP = /\([^()]*\)$/u;

const colonOf = (text: string): number =>
  text.replace(GROUP, (group) => '_'.repeat(group.length)).indexOf(': ');

const lastGroupOf = (text: string): string => LAST_GROUP.exec(text)?.[0] ?? '';

const itemOf = (line: string): string => {
  const text = line.slice(ITEM.length);
  const colon = colonOf(text);

  if (colon === -1) {
    return text;
  }

  const head = text.slice(0, colon);
  const tail = text.slice(colon + ': '.length);
  const files = tail.startsWith(ALSO) ? `(${tail.slice(ALSO.length)})` : lastGroupOf(tail);

  return files === '' ? head : `${head} ${files}`;
};

const indexOf = (context: string): readonly string[] =>
  blockListOf(context).flatMap((line) => {
    if (line.startsWith(HEADING)) {
      return [
        line.split(' (')[0] ?? line,
      ];
    }

    return line.startsWith(ITEM)
      ? [
          itemOf(line),
        ]
      : [];
  });

interface Cut {
  kept: number;
  leftOut: number;
}

const cutOf = (lines: readonly string[]): Cut => {
  const last = lines.at(-1) ?? '';
  const leftOut = last.startsWith(ITEM) || last.startsWith(HEADING) ? 0 : numberIn(last);

  return {
    kept: lines.length - (leftOut > 0 ? 1 : 0),
    leftOut,
  };
};

const listCutOf = (context: string): Cut => cutOf(blockListOf(context));

const warningSectionOf = (context: string): readonly string[] => {
  const lines = linesOf(context);
  const start = lines.findIndex((line) => line.startsWith(WARNINGS));

  if (start === -1) {
    return [];
  }

  const end = lines.indexOf('', start);

  return lines.slice(start, end === -1 ? undefined : end);
};

const warningLinesOf = (context: string): readonly string[] =>
  warningSectionOf(context).filter((line) => line.startsWith(ITEM));

type Warning = readonly string[];

interface WarningsInput {
  readonly context: string;
  readonly like: readonly Warning[];
}

const warningsOf = (input: WarningsInput): readonly Warning[] =>
  warningLinesOf(input.context).map((line, index) => [
    line.slice(ITEM.length, line.indexOf(': ')),
    ...mentionedOf({
      names: input.like[index]?.slice(1) ?? [],
      text: line,
    }),
  ]);

const remindedOf = (stdout: string): readonly string[] =>
  stdout === ''
    ? []
    : outputOf({
        exitCode: 0,
        stderr: '',
        stdout,
      })
        .context.split('\n')
        .map((note) => note.split(' ')[0] ?? '')
        .toSorted();

const bytesAfterHeader = (context: string): number =>
  Buffer.byteLength(context.slice(context.indexOf('\n\n') + 2));

const BUDGET = 9400;

interface ScriptCall {
  readonly event: Readonly<Record<string, unknown>>;
  readonly root: string;
  readonly script: string;
}

const runScript = (call: ScriptCall): HookRun => {
  const hookRun = spawnSync(
    shell,
    [
      join(call.root, 'hooks', HOOK),
      call.script.replace(/\.sh$/u, ''),
    ],
    {
      cwd: tmpdir(),
      encoding: 'utf8',
      timeout: TIMEOUT_MS,
      env: environmentOf(
        new Map([
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
            TODAY_VARIABLE,
            HOOK_TODAY,
          ],
          [
            STATE_HOME_VARIABLE,
            stateHome,
          ],
          [
            'PATH',
            `${cliFolder}:${process.env['PATH'] ?? ''}`,
          ],
        ]),
      ),
      input: JSON.stringify(call.event),
    },
  );

  return {
    exitCode: hookRun.status ?? undefined,
    stderr: hookRun.stderr,
    stdout: hookRun.stdout,
  };
};

const sessions: string[] = [];

const newSession = (): string => {
  const session = `spec-${randomUUID()}`;

  sessions.push(session);

  return session;
};

const stateFolderOf = (session: string): string =>
  join(stateHome, 'droneey-constitution', 'sessions', session);

const removeSessions = (): void => {
  for (const session of sessions.splice(0)) {
    rmSync(stateFolderOf(session), {
      force: true,
      recursive: true,
    });
  }
};

export type { HookRun };
export {
  BUDGET,
  bytesAfterHeader,
  contextOf,
  factNumberOf,
  HookEvent,
  indexOf,
  isRecord,
  listCutOf,
  mentionedOf,
  newSession,
  outputOf,
  remindedOf,
  removeSessions,
  runHook,
  runScript,
  stateFolderOf,
  warningLinesOf,
  warningsOf,
};
