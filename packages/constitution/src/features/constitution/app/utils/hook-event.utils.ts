import { attempted, isSyntaxError } from '#/kernel/utils';

// A hook's event is Claude Code's JSON on standard input. A field is read wherever it sits, as the
// first string under its name, so `command` is found inside `tool_input`; a field that is absent,
// not a string, or in an event that is no JSON reads as ''.

interface HookEvent {
  readonly field: (name: string) => string;
}

const isRecord = (parsed: unknown): parsed is Readonly<Record<string, unknown>> =>
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

const firstString = (input: { name: string; node: unknown }): string | undefined => {
  if (Array.isArray(input.node)) {
    for (const element of input.node) {
      const found = firstString({
        name: input.name,
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
    if (key === input.name && typeof child === 'string') {
      return child;
    }

    const found = firstString({
      name: input.name,
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
  attempted<unknown>({
    effect: () => JSON.parse(text),
    isRecognised: isSyntaxError,
  });

const hookEventOf = (text: string): HookEvent => {
  const parsed = parsedOf(text);

  return {
    field: (name: string): string =>
      firstString({
        name,
        node: parsed,
      }) ?? '',
  };
};

export { hookEventOf };
