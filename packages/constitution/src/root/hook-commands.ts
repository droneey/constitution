// Stryker disable all: this is the wiring of the hook commands, split out of wiring.ts by the line limit; the wiring is no logic the specs measure, and a spec of the root reaches no feature's fakes
import type { Command } from 'commander';

import type {
  GateVerdict,
  HotReminder,
  Reminder,
  SessionDigest,
  SessionId,
  SessionStart,
  StopEvent,
  StopJudgement,
} from '#/features/session';
import {
  createPostToolUseCommand,
  createPreToolUseCommand,
  createRecordCheckCommand,
  createSessionEndCommand,
  createSessionStartCommand,
  createStopCommand,
  createUserPromptSubmitCommand,
  digestSession,
  endSession,
  gateAction,
  gateTurn,
  handOverChanges,
  holdHandBack,
  judgeStop,
  keepSession,
  markShell,
  markTurn,
  recordCheck,
  recordJudgement,
  recordOwnChanges,
  recordRead,
  recordReminders,
  remindHotRules,
  remindOfFile,
  resetReading,
  settleShell,
  sweepStaleSessions,
  tellPasses,
} from '#/features/session';
import type { AbsolutePath } from '#/kernel/value-objects';

import { adopt, groupOf } from './command-tree.utils';
import { HOOK_GROUP } from './hook.constants';
import type { Registration } from './registration.types';

const gateCommandsOf = ({ context, ports }: Registration): readonly Command[] => {
  const gatePorts = {
    gates: ports.gates,
    hasher: ports.hasher,
    source: ports.activeRules,
    workingTree: ports.workingTree,
  };

  return [
    createPreToolUseCommand({
      ...context,
      gateAction: (asked): GateVerdict =>
        gateAction({
          ...asked,
          ...gatePorts,
        }),
      markShell: (marked): void => {
        markShell({
          ...marked,
          ...gatePorts,
        });
      },
    }),
    createPostToolUseCommand({
      ...context,
      recordReminders: (named): void => {
        recordReminders({
          ...named,
          sessions: ports.sessions,
        });
      },
      recordOwnChanges: (own): void => {
        recordOwnChanges({
          ...own,
          sessions: ports.sessions,
          source: ports.activeRules,
        });
      },
      recordRead: (read): void => {
        recordRead({
          ...read,
          gates: ports.gates,
          source: ports.activeRules,
        });
      },
      remindHotRules: (asked): readonly HotReminder[] =>
        remindHotRules({
          ...asked,
          ...gatePorts,
        }),
      remindOfFile: (asked): Reminder | undefined =>
        remindOfFile({
          ...asked,
          sessions: ports.sessions,
        }),
      settleShell: (settled): readonly AbsolutePath[] =>
        settleShell({
          ...settled,
          gates: ports.gates,
          workingTree: ports.workingTree,
        }),
    }),
    createStopCommand({
      ...context,
      gateTurn: (asked): GateVerdict =>
        gateTurn({
          ...asked,
          ...gatePorts,
        }),
      handOverChanges: (handing): void => {
        handOverChanges({
          ...handing,
          sessions: ports.sessions,
        });
      },
      holdHandBack: (held): boolean =>
        holdHandBack({
          ...held,
          gates: ports.gates,
          hasher: ports.hasher,
        }),
      judgeStop: (event: StopEvent): StopJudgement | undefined =>
        judgeStop({
          ...event,
          sessions: ports.sessions,
          workingTree: ports.workingTree,
        }),
      recordJudgement: (judged): void => {
        recordJudgement({
          ...judged,
          sessions: ports.sessions,
        });
      },
      tellPasses: (asked): number =>
        tellPasses({
          ...asked,
          gates: ports.gates,
        }),
    }),
  ];
};

const hookCommandsOf = (registration: Registration): Command => {
  const { context, ports, program } = registration;

  return adopt(
    groupOf({
      context,
      description: "Serve one of Claude Code's hooks, its event read from standard input.",
      examples: [
        `printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}' "$PWD" | constitution hook session-start`,
      ],
      name: HOOK_GROUP,
      parent: program,
    }),
    [
      createSessionStartCommand({
        ...context,
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        digestSession: (start: SessionStart): SessionDigest | undefined =>
          digestSession({
            ...start,
            source: ports.rules,
            workingTree: ports.workingTree,
          }),
        keepSession: (kept): void => {
          keepSession({
            ...kept,
            sessions: ports.sessions,
          });
        },
        resetReading: (reset): void => {
          resetReading({
            ...reset,
            gates: ports.gates,
          });
        },
        sweepStaleSessions: (swept): void => {
          sweepStaleSessions({
            ...swept,
            gates: ports.gates,
            source: ports.activeRules,
          });
        },
      }),
      createSessionEndCommand({
        ...context,
        endSession: (session: SessionId): void => {
          endSession({
            gates: ports.gates,
            session,
          });
        },
      }),
      ...gateCommandsOf(registration),
      createRecordCheckCommand({
        ...context,
        recordCheck: (asked): void => {
          recordCheck({
            ...asked,
            sessions: ports.sessions,
            workingTree: ports.workingTree,
          });
        },
      }),
      createUserPromptSubmitCommand({
        ...context,
        markTurn: (session: SessionId): void => {
          markTurn({
            session,
            sessions: ports.sessions,
            workingTree: ports.workingTree,
          });
        },
      }),
    ],
  );
};

export { hookCommandsOf };
