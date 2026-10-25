import { attempted, isSyntaxError } from '#/kernel/utils';
import { isNestedWithin } from '#/libs/bounded-input';

import { HookEventName, SessionOrigin } from '../../domain/entities';
import { SessionId } from '../../domain/value-objects';

// A hook's event is Claude Code's JSON on standard input. A field is read wherever it sits, as the
// first value of its kind under its name, so `command` is found inside `tool_input`; a text field
// that is absent, empty, of another kind, or in an event that is no JSON reads as absent, and a
// flag as false. An event nested deeper than any Claude Code writes is refused unparsed, as no JSON.
const MAX_EVENT_DEPTH = 64;

interface HookEvent {
  readonly field: (name: string) => string | undefined;
  readonly isTrue: (name: string) => boolean;
}

const HOOK_EVENT_TEXT = {
  [HookEventName.SessionStart]: 'SessionStart',
  [HookEventName.SubagentStart]: 'SubagentStart',
  [HookEventName.Stop]: 'Stop',
  [HookEventName.SubagentStop]: 'SubagentStop',
} as const satisfies Readonly<Record<Exclude<HookEventName, HookEventName.Unknown>, string>>;

const SESSION_ORIGIN_TEXT = {
  [SessionOrigin.Startup]: 'startup',
  [SessionOrigin.Resume]: 'resume',
  [SessionOrigin.Clear]: 'clear',
  [SessionOrigin.Compact]: 'compact',
} as const satisfies Readonly<Record<Exclude<SessionOrigin, SessionOrigin.Unknown>, string>>;

const KNOWN_EVENTS = [
  HookEventName.SessionStart,
  HookEventName.SubagentStart,
  HookEventName.Stop,
  HookEventName.SubagentStop,
] as const;

const KNOWN_ORIGINS = [
  SessionOrigin.Startup,
  SessionOrigin.Resume,
  SessionOrigin.Clear,
  SessionOrigin.Compact,
] as const;

const isRecord = (parsed: unknown): parsed is Readonly<Record<string, unknown>> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

const firstOf = <TField>(input: {
  isOfKind: (field: unknown) => field is TField;
  name: string;
  node: unknown;
}): TField | undefined => {
  if (Array.isArray(input.node)) {
    for (const element of input.node) {
      const found = firstOf({
        ...input,
        node: element,
      });

      if (found !== undefined) {
        return found;
      }
    }

    return undefined;
  }

  if (!isRecord(input.node)) {
    return undefined;
  }

  for (const [key, child] of Object.entries(input.node)) {
    if (key === input.name && input.isOfKind(child)) {
      return child;
    }

    const found = firstOf({
      ...input,
      node: child,
    });

    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
};

// An event that is no JSON leaves every field ''.
const parsedOf = (text: string): unknown =>
  isNestedWithin({
    maxDepth: MAX_EVENT_DEPTH,
    text,
  })
    ? attempted<unknown>({
        effect: () => JSON.parse(text),
        isRecognised: isSyntaxError,
      })
    : undefined;

const isString = (field: unknown): field is string => typeof field === 'string';

const isBoolean = (field: unknown): field is boolean => typeof field === 'boolean';

const hookEventOf = (text: string): HookEvent => {
  const parsed = parsedOf(text);

  return {
    field: (name: string): string | undefined => {
      const field = firstOf({
        isOfKind: isString,
        name,
        node: parsed,
      });

      return field === '' ? undefined : field;
    },
    isTrue: (name: string): boolean =>
      firstOf({
        isOfKind: isBoolean,
        name,
        node: parsed,
      }) === true,
  };
};

/** Claude Code's name of an event, as the program's; a name it does not know is Unknown. */
const hookEventNameOf = (text: string | undefined): HookEventName =>
  KNOWN_EVENTS.find((name) => HOOK_EVENT_TEXT[name] === text) ?? HookEventName.Unknown;

/** Claude Code's name of how a session started, as the program's; one it does not know is Unknown. */
const sessionOriginOf = (text: string | undefined): SessionOrigin =>
  KNOWN_ORIGINS.find((origin) => SESSION_ORIGIN_TEXT[origin] === text) ?? SessionOrigin.Unknown;

/** The session an event comes from, or undefined when its id is no plain name. */
const sessionIdOf = (event: HookEvent): SessionId | undefined => {
  const text = event.field('session_id');

  return SessionId.is(text) ? text : undefined;
};

export { HOOK_EVENT_TEXT, hookEventNameOf, hookEventOf, sessionIdOf, sessionOriginOf };
