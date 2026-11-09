import type { Command } from 'commander';

import type {
  GateVerdict,
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
  handOverChanges,
  holdHandBack,
  isSessionStarted,
  judgeStop,
  keepSession,
  markShell,
  markTurn,
  recordCheck,
  recordJudgement,
  recordOwnChanges,
  recordRead,
  recordReminders,
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
    gateRepository: ports.gateRepository,
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
          sessionRepository: ports.sessionRepository,
        });
      },
      recordOwnChanges: (own): void => {
        recordOwnChanges({
          ...own,
          sessionRepository: ports.sessionRepository,
          source: ports.activeRules,
          workingTree: ports.workingTree,
        });
      },
      recordRead: (read): void => {
        recordRead({
          ...read,
          gateRepository: ports.gateRepository,
          source: ports.activeRules,
          workingTree: ports.workingTree,
        });
      },
      remindOfFile: (asked): Reminder | undefined =>
        remindOfFile({
          ...asked,
          sessionQueries: ports.sessionQueries,
          workingTree: ports.workingTree,
        }),
      settleShell: (settled): readonly AbsolutePath[] =>
        settleShell({
          ...settled,
          gateRepository: ports.gateRepository,
          workingTree: ports.workingTree,
        }),
    }),
    createStopCommand({
      ...context,
      handOverChanges: (handing): void => {
        handOverChanges({
          ...handing,
          sessionRepository: ports.sessionRepository,
        });
      },
      holdHandBack: (held): boolean =>
        holdHandBack({
          ...held,
          gateRepository: ports.gateRepository,
          hasher: ports.hasher,
        }),
      judgeStop: (event: StopEvent): StopJudgement | undefined =>
        judgeStop({
          ...event,
          sessionQueries: ports.sessionQueries,
          workingTree: ports.workingTree,
        }),
      recordJudgement: (judged): void => {
        recordJudgement({
          ...judged,
          sessionRepository: ports.sessionRepository,
        });
      },
      tellPasses: (asked): number =>
        tellPasses({
          ...asked,
          gateRepository: ports.gateRepository,
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
            sessionRepository: ports.sessionRepository,
          });
        },
        resetReading: (reset): void => {
          resetReading({
            ...reset,
            gateRepository: ports.gateRepository,
          });
        },
        sweepStaleSessions: (swept): void => {
          sweepStaleSessions({
            ...swept,
            gateRepository: ports.gateRepository,
            source: ports.activeRules,
          });
        },
      }),
      createSessionEndCommand({
        ...context,
        endSession: (session: SessionId): void => {
          endSession({
            gateRepository: ports.gateRepository,
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
            sessionRepository: ports.sessionRepository,
            workingTree: ports.workingTree,
          });
        },
      }),
      createUserPromptSubmitCommand({
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
        isSessionStarted: (session: SessionId): boolean =>
          isSessionStarted({
            session,
            sessionQueries: ports.sessionQueries,
          }),
        keepSession: (kept): void => {
          keepSession({
            ...kept,
            sessionRepository: ports.sessionRepository,
          });
        },
        markTurn: (session: SessionId): void => {
          markTurn({
            session,
            sessionRepository: ports.sessionRepository,
            workingTree: ports.workingTree,
          });
        },
      }),
    ],
  );
};

export { hookCommandsOf };
