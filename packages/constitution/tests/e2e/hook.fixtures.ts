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

// Folders are relative to the project root.
interface HookCall {
  cwd?: string | undefined;
  // the distribution linked into the project, the plugin root's by default
  distribution?: string | undefined;
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
  // neither XDG_STATE_HOME nor HOME is set, so no folder keeps the session
  stateHomeUnset?: boolean | undefined;
  // no distribution is linked into the project
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

// CI's macOS entry of the hooks matrix sets HOOK_SHELL=/bin/bash to run the hook under bash 3.2.
const shell: string = process.env['HOOK_SHELL'] ?? 'bash';
const WARNINGS = '⚠️ Warnings';
// A session carries the user's locale; the hook must not depend on it.
const LOCALE = 'en_US.UTF-8';
const PLACEHOLDER = '@';
const NOT_UTF8 = 0xe9;
// A hook that blocks, on a named pipe say, fails its case instead of the run.
const TIMEOUT_MS = 20_000;
// The day the hook's clock gives, by the variable the root reads: the spec never reads the real clock.
const HOOK_TODAY = '2026-06-15';
const TODAY_VARIABLE = 'CONSTITUTION_TODAY';
const HOOK = 'hook.sh';
const STATE_HOME_VARIABLE = 'XDG_STATE_HOME';

// The state home of every hook the specs run, so none writes into the user's: a folder of this
// process's own, removed when it exits.
const stateHome = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-state-')));

process.once('exit', () => {
  rmSync(stateHome, {
    force: true,
    recursive: true,
  });
});

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
    bytes[placeholder] = input.nonUtf8Byte ? NOT_UTF8 : PLACEHOLDER.charCodeAt(0);
  }

  return bytes;
};

// A clean environment: the session that runs the tests sets CLAUDE_PROJECT_DIR
// and CLAUDE_PLUGIN_ROOT of its own.
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
    throw new Error(`The hook printed no hookSpecificOutput object: ${run.stdout}`);
  }

  return {
    context: inner['additionalContext'],
    event: inner['hookEventName'],
  };
};

const contextOf = (run: HookRun): string => outputOf(run).context;

const linesOf = (context: string): readonly string[] => context.replace(/\n$/, '').split('\n');

// The digest is read by its marks, a list item's "- " and a heading's "## ", and
// by the names it gives, never by its wording: a sentence reworded breaks no case.
const ITEM = '- ';
const HEADING = '## ';
// The note that closes a block list cut short opens with the number of lines it leaves out.
const NOTE = /^\d/u;

// A character of a name, a path or a date: a name is mentioned where none borders it.
const NAME_CHARACTER = /[\w./-]/u;

const isMentioned = (input: { name: string; text: string }): boolean => {
  const { name, text } = input;

  for (let at = text.indexOf(name); at !== -1; at = text.indexOf(name, at + 1)) {
    const after = at + name.length;
    // a full stop that ends a sentence borders a name too
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

// The number the header's fact gives: how many blocks are active, or the line
// at which constitution.yaml does not parse.
const factNumberOf = (context: string): number => numberIn(headerOf(context)[1] ?? '');

// The block list closes the digest, the paragraph after core's text: it opens
// with a heading or, when none of its lines fit, is the note alone.
const blockListOf = (context: string): readonly string[] => {
  const lines = linesOf(context);
  const list = lines.slice(lines.lastIndexOf('') + 1);
  const [first = ''] = list;

  return first.startsWith(HEADING) || (list.length === 1 && NOTE.test(first)) ? list : [];
};

// The mark of an application's item that adds files to a block the repository lists.
const ALSO = 'Also: ';

const GROUP = /\([^()]*\)/gu;
const LAST_GROUP = /\([^()]*\)$/u;

// Where a line's first ": " outside brackets starts, or -1.
const colonOf = (text: string): number =>
  text.replace(GROUP, (group) => '_'.repeat(group.length)).indexOf(': ');

const lastGroupOf = (text: string): string => LAST_GROUP.exec(text)?.[0] ?? '';

// An item as its id, the brackets that follow it and the bracketed files that
// close it; the summary between, or an override's level, is left out.
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

// The block list as its headings, without the folder they name, and its items;
// the summaries and the prose between are left out.
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
  // the lines given, or the warnings
  kept: number;
  // the number the note closing them gives, or 0 with no note
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

// A warning as its code, then the names it gives.
type Warning = readonly string[];

interface WarningsInput {
  readonly context: string;
  readonly like: readonly Warning[];
}

// Each warning given, read as its code and, of the names its counterpart in
// `like` gives, those it mentions: the words around them are wording.
const warningsOf = (input: WarningsInput): readonly Warning[] =>
  warningLinesOf(input.context).map((line, index) => [
    line.slice(ITEM.length, line.indexOf(': ')),
    ...mentionedOf({
      names: input.like[index]?.slice(1) ?? [],
      text: line,
    }),
  ]);

// The blocks a reminder's notes name, one note to a line, each opening with its block's id.
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

// The hook's budget of the digest after its header.
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

// A spec isolates its state by a session id of its own: the state home is shared by the process.
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
