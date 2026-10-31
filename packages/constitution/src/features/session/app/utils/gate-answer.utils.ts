import type { AbsolutePath } from '#/kernel/value-objects';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { GateCause, GateVerdict } from '../../domain/entities';
import { GateCauseKind, GateVerdictKind, HookEventName } from '../../domain/entities';
import { HOOK_EVENT_TEXTS } from '../constants';
import { moreFilesText } from './bounded-list.messages';
import { listWithin } from './bounded-list.utils';
import { countedTextOf } from './counted-text.utils';
import type { OwedInput } from './gate.messages';
import {
  causeLineMessage,
  changedByCommandsMessage,
  closedMessage,
  governingRulesText,
  moreCausesText,
  morePartsText,
  noReleaseCauseMessage,
  partLineMessage,
  passedClosedMessage,
  passedUnreadText,
  refusedMessage,
  turnHeldMessage,
  unignoredMessage,
  unparsedCauseMessage,
  unreadableCauseMessage,
  unwritableCauseMessage,
} from './gate.messages';
import type { HookOutput } from './hook-output.utils';
import { capShareOf } from './hook-output.utils';

const CAP_SHARES_PERCENT = {
  causes: 40,
  changedPaths: 20,
  parts: 40,
} as const;

type RefusedVerdict = Extract<
  GateVerdict,
  {
    kind: GateVerdictKind.Refused;
  }
>;

const changedLinesOf = (changed: readonly AbsolutePath[]): readonly string[] =>
  changed.length === 0
    ? []
    : [
        changedByCommandsMessage(
          listWithin({
            budget: capShareOf(CAP_SHARES_PERCENT.changedPaths),
            lines: changed,
            note: moreFilesText,
          }).join(LIST_SEPARATOR),
        ),
      ];

const owedOf = (verdict: RefusedVerdict): OwedInput => ({
  changedLines: changedLinesOf(verdict.changedByCommands),
  governingRules: countedTextOf({
    count: verdict.unreadCount,
    text: governingRulesText,
  }),
  partLines: listWithin({
    budget: capShareOf(CAP_SHARES_PERCENT.parts),
    lines: verdict.parts.map(partLineMessage),
    note: morePartsText,
  }),
});

const causeTextOf = (cause: GateCause): string => {
  switch (cause.kind) {
    case GateCauseKind.Unparsed:
      return unparsedCauseMessage(cause);
    case GateCauseKind.NoRelease:
      return noReleaseCauseMessage(cause.releaseFolderPath);
    case GateCauseKind.Unreadable:
      return unreadableCauseMessage(cause.file);
    case GateCauseKind.Failed:
      return cause.reason;
    case GateCauseKind.Unwritable:
      return unwritableCauseMessage(cause.folder);
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return cause satisfies never;
  }
};

const causeLinesOf = (causes: readonly GateCause[]): readonly string[] =>
  listWithin({
    budget: capShareOf(CAP_SHARES_PERCENT.causes),
    lines: causes.map((cause) => causeLineMessage(causeTextOf(cause))),
    note: moreCausesText,
  });

const denialOf = (reason: string): HookOutput => ({
  hookSpecificOutput: {
    hookEventName: HOOK_EVENT_TEXTS[HookEventName.PreToolUse],
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
});

const actionAnswerOf = (verdict: GateVerdict): HookOutput | undefined => {
  switch (verdict.kind) {
    case GateVerdictKind.Allowed:
      return undefined;
    case GateVerdictKind.Closed:
      return denialOf(closedMessage(causeLinesOf(verdict.causes)));
    case GateVerdictKind.PassedClosed:
      return {
        systemMessage: passedClosedMessage(causeLinesOf(verdict.causes)),
      };
    case GateVerdictKind.PassedUnread:
      return {
        systemMessage: countedTextOf({
          count: verdict.unreadCount,
          text: passedUnreadText,
        }),
      };
    case GateVerdictKind.Refused:
      return {
        ...denialOf(refusedMessage(owedOf(verdict))),
        ...(verdict.shouldIgnoreParts
          ? {
              systemMessage: unignoredMessage,
            }
          : {}),
      };
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return verdict satisfies never;
  }
};

const turnAnswerOf = (verdict: GateVerdict): HookOutput | undefined => {
  switch (verdict.kind) {
    case GateVerdictKind.Allowed:
    case GateVerdictKind.PassedClosed:
    case GateVerdictKind.PassedUnread:
      return undefined;
    case GateVerdictKind.Closed:
      return {
        decision: 'block',
        reason: closedMessage(causeLinesOf(verdict.causes)),
      };
    case GateVerdictKind.Refused:
      return {
        decision: 'block',
        reason: turnHeldMessage(owedOf(verdict)),
      };
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return verdict satisfies never;
  }
};

export { actionAnswerOf, turnAnswerOf };
