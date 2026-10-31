import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { GateCause, GateVerdict } from '../../../domain/entities';
import { GateCauseKind, GateVerdictKind } from '../../../domain/entities';
import { moreFilesText } from '../bounded-list.messages';
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
} from '../gate.messages';
import { actionAnswerOf, turnAnswerOf } from '../gate-answer.utils';
import type { HookOutput } from '../hook-output.utils';

const CLAUDE_CODE_TEXT_CAP = 10_000;

const part = AbsolutePath.create('/work/.droneey/constitution-sessions/s1/parts/abc.1.md');
const changed = AbsolutePath.create('/work/src/b.ts');
const config = AbsolutePath.create('/work/constitution.yaml');
const releaseFolderPath = AbsolutePath.create('/opt/release');
const unreadableFile = AbsolutePath.create('/srv/blocks/core.md');
const FAILURE = 'the release cannot be listed';
const unwritableFolder = AbsolutePath.create('/home/project');

const numberedPathsOf = (input: {
  count: number;
  extension: string;
  folder: string;
}): readonly AbsolutePath[] =>
  Array.from(
    {
      length: input.count,
    },
    (_, index) =>
      AbsolutePath.create(`${input.folder}/${String(index).padStart(4, '0')}.${input.extension}`),
  );

const manyParts = numberedPathsOf({
  count: 500,
  extension: 'md',
  folder: `/work/.droneey/constitution-sessions/s1/parts/${'x'.repeat(360)}`,
});
const manyChanged = numberedPathsOf({
  count: 500,
  extension: 'ts',
  folder: '/work/src',
});
const failureReasons: readonly string[] = Array.from(
  {
    length: 200,
  },
  (_, index) => `${String(index).padStart(4, '0')} ${'x'.repeat(412)}`,
);
const manyFailures: readonly GateCause[] = failureReasons.map((reason) => ({
  kind: GateCauseKind.Failed,
  reason,
}));

const refusedOf = (input: {
  shouldIgnoreParts: boolean;
  changedByCommands: readonly AbsolutePath[];
  parts?: readonly AbsolutePath[];
  unreadCount?: number;
}): Extract<
  GateVerdict,
  {
    kind: GateVerdictKind.Refused;
  }
> => ({
  shouldIgnoreParts: input.shouldIgnoreParts,
  changedByCommands: input.changedByCommands,
  kind: GateVerdictKind.Refused,
  parts: input.parts ?? [
    part,
  ],
  unreadCount: input.unreadCount ?? 3,
});

const causes: readonly GateCause[] = [
  {
    config,
    kind: GateCauseKind.Unparsed,
    lines: [
      3,
    ],
  },
  {
    kind: GateCauseKind.NoRelease,
    releaseFolderPath,
  },
  {
    file: unreadableFile,
    kind: GateCauseKind.Unreadable,
  },
  {
    kind: GateCauseKind.Failed,
    reason: FAILURE,
  },
  {
    folder: unwritableFolder,
    kind: GateCauseKind.Unwritable,
  },
];

const closed: GateVerdict = {
  causes,
  kind: GateVerdictKind.Closed,
};

const causeLines = [
  unparsedCauseMessage({
    config,
    lines: [
      3,
    ],
  }),
  noReleaseCauseMessage(releaseFolderPath),
  unreadableCauseMessage(unreadableFile),
  FAILURE,
  unwritableCauseMessage(unwritableFolder),
].map(causeLineMessage);

const closedReason = closedMessage(causeLines);

const owedOne = {
  governingRules: governingRulesText.many(3),
  partLines: [
    partLineMessage(part),
  ],
};

const denialOf = (reason: string): HookOutput => ({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
});

const reasonOf = (answer: HookOutput | undefined): string => {
  if (answer === undefined) {
    return '';
  }

  if ('reason' in answer) {
    return answer.reason;
  }

  return 'hookSpecificOutput' in answer && 'permissionDecisionReason' in answer.hookSpecificOutput
    ? answer.hookSpecificOutput.permissionDecisionReason
    : '';
};

const toldOf = (answer: HookOutput | undefined): string =>
  answer !== undefined && 'systemMessage' in answer ? (answer.systemMessage ?? '') : '';

const namedValuesOf = (reason: string) => ({
  changed: reason.includes(changed),
  config: reason.includes(config),
  failure: reason.includes(FAILURE),
  part: reason.includes(`- ${part}`),
  releaseFolderPath: reason.includes(releaseFolderPath),
  unreadableFile: reason.includes(unreadableFile),
  unwritableFolder: reason.includes(unwritableFolder),
});

describe('actionAnswerOf', () => {
  it.each<{
    answer: HookOutput | undefined;
    condition: string;
    verdict: GateVerdict;
  }>([
    {
      answer: undefined,
      condition: 'every rule was read',
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
    {
      answer: denialOf(
        refusedMessage({
          ...owedOne,
          changedLines: [
            changedByCommandsMessage(changed),
          ],
        }),
      ),
      condition: 'git ignores the parts and a command changed a file',
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: [
          changed,
        ],
      }),
    },
    {
      answer: {
        ...denialOf(
          refusedMessage({
            ...owedOne,
            changedLines: [],
          }),
        ),
        systemMessage: unignoredMessage,
      },
      condition: 'the parts lie where git does not ignore them and no command changed a file',
      verdict: refusedOf({
        shouldIgnoreParts: true,
        changedByCommands: [],
      }),
    },
    {
      answer: denialOf(
        refusedMessage({
          changedLines: [],
          governingRules: governingRulesText.one,
          partLines: [
            partLineMessage(part),
          ],
        }),
      ),
      condition: 'one rule is unread',
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: [],
        unreadCount: 1,
      }),
    },
    {
      answer: denialOf(closedReason),
      condition: 'the Constitution the project declares cannot be read',
      verdict: closed,
    },
    {
      answer: {
        systemMessage: passedUnreadText.many(2),
      },
      condition: 'the gate passes after three refusals of unread rules',
      verdict: {
        kind: GateVerdictKind.PassedUnread,
        unreadCount: 2,
      },
    },
    {
      answer: {
        systemMessage: passedUnreadText.one,
      },
      condition: 'the gate passes after three refusals of one unread rule',
      verdict: {
        kind: GateVerdictKind.PassedUnread,
        unreadCount: 1,
      },
    },
    {
      answer: {
        systemMessage: passedClosedMessage(causeLines),
      },
      condition: 'the gate passes after three refusals of a closed gate',
      verdict: {
        causes,
        kind: GateVerdictKind.PassedClosed,
      },
    },
  ])('should answer the action as the gate tells when $condition', ({ answer, verdict }) => {
    // Act
    const answered = actionAnswerOf(verdict);

    // Assert
    expect(answered).toStrictEqual(answer);
  });

  it.each([
    {
      condition: 'the gate refuses it',
      named: {
        changed: true,
        config: false,
        failure: false,
        part: true,
        releaseFolderPath: false,
        unreadableFile: false,
        unwritableFolder: false,
      },
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: [
          changed,
        ],
      }),
    },
    {
      condition: 'the gate is closed',
      named: {
        changed: false,
        config: true,
        failure: true,
        part: false,
        releaseFolderPath: true,
        unreadableFile: true,
        unwritableFolder: true,
      },
      verdict: closed,
    },
  ])(
    'should name in its reason the values of the verdict when $condition',
    ({ named, verdict }) => {
      // Act
      const reason = reasonOf(actionAnswerOf(verdict));

      // Assert
      expect(namedValuesOf(reason)).toStrictEqual(named);
    },
  );

  it('should name why the gate was closed when it lets the action through after three refusals', () => {
    // Arrange
    const verdict: GateVerdict = {
      causes,
      kind: GateVerdictKind.PassedClosed,
    };

    // Act
    const told = toldOf(actionAnswerOf(verdict));

    // Assert
    expect(namedValuesOf(told)).toStrictEqual({
      changed: false,
      config: true,
      failure: true,
      part: false,
      releaseFolderPath: true,
      unreadableFile: true,
      unwritableFolder: true,
    });
  });

  it.each([
    {
      condition: 'how many rules are unread when it refuses',
      count: '17',
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: [],
        unreadCount: 17,
      }),
    },
    {
      condition: 'how many changed files it leaves out',
      count: '389',
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: manyChanged,
      }),
    },
    {
      condition: 'how many parts it leaves out',
      count: '491',
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: [],
        parts: manyParts,
      }),
    },
    {
      condition: 'how many causes it leaves out',
      count: '191',
      verdict: {
        causes: manyFailures,
        kind: GateVerdictKind.Closed,
      } satisfies GateVerdict,
    },
  ])('should tell in its reason $condition', ({ count, verdict }) => {
    // Act
    const reason = reasonOf(actionAnswerOf(verdict));

    // Assert
    expect(reason.includes(count)).toBe(true);
  });

  it('should tell how many rules are still unread when it lets the action through', () => {
    // Arrange
    const verdict: GateVerdict = {
      kind: GateVerdictKind.PassedUnread,
      unreadCount: 17,
    };

    // Act
    const told = toldOf(actionAnswerOf(verdict));

    // Assert
    expect(told.includes('17')).toBe(true);
  });

  it('should name the files a command changed within 2,000 bytes and the parts within 4,000, counting the others', () => {
    // Arrange
    const verdict = refusedOf({
      shouldIgnoreParts: false,
      changedByCommands: manyChanged,
      parts: manyParts,
      unreadCount: 900,
    });

    // Act
    const answer = actionAnswerOf(verdict);

    // Assert
    expect(answer).toStrictEqual(
      denialOf(
        refusedMessage({
          changedLines: [
            changedByCommandsMessage(
              [
                ...manyChanged.slice(0, 111),
                moreFilesText.many(389),
              ].join(LIST_SEPARATOR),
            ),
          ],
          governingRules: governingRulesText.many(900),
          partLines: [
            ...manyParts.slice(0, 9).map(partLineMessage),
            morePartsText.many(491),
          ],
        }),
      ),
    );
  });

  it('should name the causes within 4,000 bytes, counting the others, when the gate is closed for many', () => {
    // Arrange
    const verdict: GateVerdict = {
      causes: manyFailures,
      kind: GateVerdictKind.Closed,
    };

    // Act
    const answer = actionAnswerOf(verdict);

    // Assert
    expect(answer).toStrictEqual(
      denialOf(
        closedMessage([
          ...failureReasons.slice(0, 9).map(causeLineMessage),
          moreCausesText.many(191),
        ]),
      ),
    );
  });

  it.each([
    {
      condition: 'many files changed and many parts are owed',
      verdict: refusedOf({
        shouldIgnoreParts: true,
        changedByCommands: manyChanged,
        parts: manyParts,
      }),
    },
    {
      condition: 'the gate is closed for many causes',
      verdict: {
        causes: manyFailures,
        kind: GateVerdictKind.Closed,
      } satisfies GateVerdict,
    },
    {
      condition: 'the gate passes a closed gate of many causes',
      verdict: {
        causes: manyFailures,
        kind: GateVerdictKind.PassedClosed,
      } satisfies GateVerdict,
    },
  ])("should keep its answer within Claude Code's cap when $condition", ({ verdict }) => {
    // Act
    const answer = actionAnswerOf(verdict);

    // Assert
    expect(JSON.stringify(answer).length < CLAUDE_CODE_TEXT_CAP).toBe(true);
  });
});

describe('turnAnswerOf', () => {
  it.each<{
    answer: HookOutput | undefined;
    condition: string;
    verdict: GateVerdict;
  }>([
    {
      answer: {
        decision: 'block',
        reason: turnHeldMessage({
          ...owedOne,
          changedLines: [
            changedByCommandsMessage(changed),
          ],
        }),
      },
      condition: 'the agent owes rules',
      verdict: refusedOf({
        shouldIgnoreParts: false,
        changedByCommands: [
          changed,
        ],
      }),
    },
    {
      answer: {
        decision: 'block',
        reason: closedReason,
      },
      condition: 'the gate is closed',
      verdict: closed,
    },
    {
      answer: undefined,
      condition: 'every rule was read',
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
    {
      answer: undefined,
      condition: 'the gate passed after three refusals',
      verdict: {
        kind: GateVerdictKind.PassedUnread,
        unreadCount: 2,
      },
    },
    {
      answer: undefined,
      condition: 'the gate passed a closed gate after three refusals',
      verdict: {
        causes,
        kind: GateVerdictKind.PassedClosed,
      },
    },
  ])('should answer the turn as the gate tells when $condition', ({ answer, verdict }) => {
    // Act
    const answered = turnAnswerOf(verdict);

    // Assert
    expect(answered).toStrictEqual(answer);
  });

  it("should keep its reason within Claude Code's cap when many files changed and many parts are owed", () => {
    // Arrange
    const verdict = refusedOf({
      shouldIgnoreParts: false,
      changedByCommands: manyChanged,
      parts: manyParts,
    });

    // Act
    const answer = turnAnswerOf(verdict);

    // Assert
    expect(JSON.stringify(answer).length < CLAUDE_CODE_TEXT_CAP).toBe(true);
  });

  it('should name in its reason each part to read and each file a command changed', () => {
    // Arrange
    const verdict = refusedOf({
      shouldIgnoreParts: false,
      changedByCommands: [
        changed,
      ],
    });

    // Act
    const reason = reasonOf(turnAnswerOf(verdict));

    // Assert
    expect(namedValuesOf(reason)).toStrictEqual({
      changed: true,
      config: false,
      failure: false,
      part: true,
      releaseFolderPath: false,
      unreadableFile: false,
      unwritableFolder: false,
    });
  });
});
