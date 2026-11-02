import type { HookEventText, NamedHookEvent } from '../constants';
import { HOOK_EVENT_TEXTS } from '../constants';

// Why: Claude Code saves an additionalContext or a systemMessage over 10,000 characters to a file
// and shows a preview of its first 2,000. A reason it shows the agent is held to the same cap, so no
// text the agent must read grows past it. A share is counted in bytes, and a character takes one at
// least.
const HOOK_TEXT_CAP_CHARACTERS = 10_000;
const HUNDRED_PERCENT = 100;

const capShareOf = (percent: number): number =>
  (HOOK_TEXT_CAP_CHARACTERS * percent) / HUNDRED_PERCENT;

type HookOutput =
  | {
      readonly decision: 'block';
      readonly reason: string;
      readonly systemMessage?: string;
    }
  | {
      readonly systemMessage: string;
    }
  | {
      readonly hookSpecificOutput: {
        readonly additionalContext: string;
        readonly hookEventName: HookEventText;
      };
    }
  | {
      readonly hookSpecificOutput: {
        readonly hookEventName: HookEventText;
        readonly permissionDecision: 'deny';
        readonly permissionDecisionReason: string;
      };
      readonly systemMessage?: string;
    };

const hookOutputOf = (output: HookOutput): string => `${JSON.stringify(output)}\n`;

interface ContextOutputInput {
  readonly event: NamedHookEvent;
  readonly text: string;
}

const contextOutputOf = (input: ContextOutputInput): string =>
  hookOutputOf({
    hookSpecificOutput: {
      additionalContext: input.text,
      hookEventName: HOOK_EVENT_TEXTS[input.event],
    },
  });

export type { HookOutput };
export { capShareOf, contextOutputOf, hookOutputOf };
