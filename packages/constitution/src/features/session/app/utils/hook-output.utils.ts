/** The JSON a hook answers Claude Code with, in Claude Code's fields. */
type HookOutput =
  | {
      readonly decision: 'block';
      readonly reason: string;
    }
  | {
      readonly systemMessage: string;
    }
  | {
      readonly hookSpecificOutput: {
        readonly additionalContext: string;
        readonly hookEventName: string;
      };
    };

const hookOutputOf = (output: HookOutput): string => `${JSON.stringify(output)}\n`;

interface ContextOutputInput {
  readonly event: string;
  readonly text: string;
}

const contextOutputOf = (input: ContextOutputInput): string =>
  hookOutputOf({
    hookSpecificOutput: {
      additionalContext: input.text,
      hookEventName: input.event,
    },
  });

export { contextOutputOf, hookOutputOf };
