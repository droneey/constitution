import type { z } from 'zod';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { isNestedWithin } from '#/libs/bounded-input';

// An event nested deeper than any Claude Code writes is refused unparsed, as one that is no JSON.
const MAX_EVENT_DEPTH = 64;

const isRecord = (parsed: unknown): parsed is Readonly<Record<string, unknown>> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

const objectOf = (text: string): Readonly<Record<string, unknown>> => {
  const parsed = isNestedWithin({
    maxDepth: MAX_EVENT_DEPTH,
    text,
  })
    ? attempted<unknown>({
        effect: () => JSON.parse(text),
        isRecognised: isSyntaxError,
      })
    : undefined;

  return isRecord(parsed) ? parsed : {};
};

interface HookEventInput<TEvent> {
  /** a schema that reads any object, each field it cannot read as absent */
  readonly schema: z.ZodType<TEvent>;
  readonly text: string;
}

/** A hook's event, Claude Code's JSON on standard input, as its schema reads it. */
const hookEventOf = <TEvent>(input: HookEventInput<TEvent>): TEvent =>
  input.schema.parse(objectOf(input.text));

export { hookEventOf };
