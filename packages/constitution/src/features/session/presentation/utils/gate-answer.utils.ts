import type { AbsolutePath } from '#/kernel/value-objects';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { GateCause, GateVerdict, ReadingCount } from '../../domain/gate/entities';
import { GateCauseKind, GateVerdictKind } from '../../domain/gate/entities';
import { HookEventName } from '../../domain/shared/entities';
import { HOOK_EVENT_TEXTS } from '../constants';
import { moreFilesText } from './bounded-list.messages';
import { listWithin } from './bounded-list.utils';
import { countedTextOf } from './counted-text.utils';
import type { OwedCount, OwedInput } from './gate.messages';
import {
  causeLineMessage,
  changedByCommandsMessage,
  closedMessage,
  governingMessage,
  moreCausesText,
  morePartsText,
  noReleaseCauseMessage,
  partLineMessage,
  passedClosedMessage,
  passedUnreadMessage,
  refusedMessage,
  unignoredMessage,
  unparsedCauseMessage,
  unreadableCauseMessage,
  unreadDefinitionsText,
  unreadRulesText,
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

const owedCountOf = (unread: ReadingCount): OwedCount => ({
  isOne: unread.definitions + unread.rules === 1,
  owed: [
    ...(unread.rules === 0
      ? []
      : [
          countedTextOf({
            count: unread.rules,
            text: unreadRulesText,
          }),
        ]),
    ...(unread.definitions === 0
      ? []
      : [
          countedTextOf({
            count: unread.definitions,
            text: unreadDefinitionsText,
          }),
        ]),
  ].join(' and '),
});

const owedOf = (verdict: RefusedVerdict): OwedInput => ({
  changedLines: changedLinesOf(verdict.changedByCommands),
  governingRules: governingMessage(owedCountOf(verdict.unread)),
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
      return;
    case GateVerdictKind.Closed:
      return denialOf(closedMessage(causeLinesOf(verdict.causes)));
    case GateVerdictKind.PassedClosed:
      return {
        systemMessage: passedClosedMessage(causeLinesOf(verdict.causes)),
      };
    case GateVerdictKind.PassedUnread:
      return {
        systemMessage: passedUnreadMessage(owedCountOf(verdict.unread)),
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
  }
};

export { actionAnswerOf, causeLinesOf };
