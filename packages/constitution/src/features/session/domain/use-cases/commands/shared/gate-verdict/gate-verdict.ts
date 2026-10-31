import { sessionsFolderInProject } from '#/kernel/constants';
import { firstBy } from '#/kernel/utils';
import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { TextHasher, WorkingTree } from '../../../../contracts';
import { IgnoreAnswer } from '../../../../contracts';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import type { AgentInSession, GateVerdict, RuleDebt, RulesRead } from '../../../../entities';
import {
  DebtKind,
  GateCause,
  GateCauseKind,
  GatedRule,
  GateVerdictKind,
  TargetKind,
} from '../../../../entities';
import { RuleSetHash } from '../../../../value-objects';
import type { ProjectRules, RulesOwedFor, TargetRules } from '../owe-rules';
import { recordRefusalOrPass } from '../refusal-streak';

interface DebtRules {
  readonly debt: RuleDebt;
  readonly owed: TargetRules;
}

interface DebtRulesInput extends AgentInSession {
  readonly gates: GateCommandRepository;
  readonly owedFor: RulesOwedFor;
}

interface GatePorts extends AgentInSession {
  readonly gates: GateCommandRepository;
  readonly hasher: TextHasher;
  readonly workingTree: WorkingTree;
}

interface VerdictInput extends GatePorts {
  readonly closing: readonly GateCause[];
  readonly debts: readonly DebtRules[];
  readonly owed: readonly TargetRules[];
}

interface UnreadProject {
  readonly folderPath: AbsolutePath;
  readonly unread: readonly GatedRule[];
}

const uniqueCausesOf = (causes: readonly GateCause[]): readonly GateCause[] => [
  ...firstBy(causes, GateCause.keyOf).values(),
];

const debtRulesOf = (input: DebtRulesInput): readonly DebtRules[] =>
  input.gates.debts(input).map((debt) => ({
    debt,
    owed: input.owedFor({
      kind: TargetKind.File,
      path: debt.path,
    }),
  }));

const unreadIn = (project: ProjectRules | undefined, read: RulesRead): readonly GatedRule[] =>
  (project?.rules ?? []).filter((rule) => !GatedRule.isRead(rule, read));

const isPaid = (debt: DebtRules, read: RulesRead): boolean =>
  debt.owed.causes.length === 0 && unreadIn(debt.owed.project, read).length === 0;

const closedOf = (
  input: GatePorts & {
    causes: readonly GateCause[];
  },
): GateVerdict => {
  const isPassed = recordRefusalOrPass({
    ...input,
    refused: JSON.stringify(input.causes.map(GateCause.keyOf).toSorted()),
  });

  return {
    causes: input.causes,
    kind: isPassed ? GateVerdictKind.PassedClosed : GateVerdictKind.Closed,
  };
};

const settlePaidDebts = (
  input: GatePorts & {
    debts: readonly DebtRules[];
    read: RulesRead;
  },
): void => {
  input.gates.settleDebts({
    ...input,
    debts: input.debts.filter((debt) => isPaid(debt, input.read)).map((debt) => debt.debt),
  });
};

const unreadProjectsOf = (input: {
  owed: readonly TargetRules[];
  read: RulesRead;
}): readonly UnreadProject[] =>
  input.owed
    .map((owed) => owed.project)
    .filter((project) => project !== undefined)
    .map((project) => ({
      folderPath: project.folderPath,
      unread: unreadIn(project, input.read),
    }))
    .filter((project) => project.unread.length > 0);

const refusedOf = (input: {
  debts: readonly DebtRules[];
  parts: readonly AbsolutePath[];
  projectFolderPath: AbsolutePath;
  read: RulesRead;
  unreadCount: number;
  workingTree: WorkingTree;
}): GateVerdict => ({
  changedByCommands: input.debts
    .filter(
      (debt) =>
        debt.debt.kind === DebtKind.Changed && unreadIn(debt.owed.project, input.read).length > 0,
    )
    .map((debt) => debt.debt.path),
  kind: GateVerdictKind.Refused,
  parts: input.parts,
  shouldIgnoreParts:
    input.workingTree.isIgnored({
      path: RepositoryRelativePath.create(sessionsFolderInProject),
      repositoryFolderPath: input.projectFolderPath,
    }) === IgnoreAnswer.NotIgnored,
  unreadCount: input.unreadCount,
});

const unreadVerdictOf = (
  input: VerdictInput & {
    projectFolderPath: AbsolutePath;
    read: RulesRead;
    unread: readonly GatedRule[];
  },
): GateVerdict => {
  const { unread } = input;
  const unreadText = GatedRule.hashedTextOfSet(unread);
  const parts = input.gates.writeParts({
    projectFolderPath: input.projectFolderPath,
    rules: unread,
    session: input.session,
    set: RuleSetHash.create(input.hasher.hashOf(unreadText)),
  });

  if (parts.length === 0) {
    return closedOf({
      ...input,
      causes: [
        {
          folder: input.projectFolderPath,
          kind: GateCauseKind.Unwritable,
        },
      ],
    });
  }

  if (
    recordRefusalOrPass({
      ...input,
      refused: unreadText,
    })
  ) {
    return {
      kind: GateVerdictKind.PassedUnread,
      unreadCount: unread.length,
    };
  }

  return refusedOf({
    ...input,
    parts,
    unreadCount: unread.length,
  });
};

const verdictOf = (input: VerdictInput): GateVerdict => {
  if (input.closing.length > 0) {
    return closedOf({
      ...input,
      causes: input.closing,
    });
  }

  const read = input.gates.rulesRead(input);

  settlePaidDebts({
    ...input,
    read,
  });

  const projects = unreadProjectsOf({
    owed: input.owed,
    read,
  });
  const [project] = projects;

  if (project === undefined) {
    return {
      kind: GateVerdictKind.Allowed,
    };
  }

  return unreadVerdictOf({
    ...input,
    projectFolderPath: project.folderPath,
    read,
    unread: [
      ...firstBy(
        projects.flatMap((each) => each.unread),
        GatedRule.keyOf,
      ).values(),
    ],
  });
};

export type { DebtRules, GatePorts };
export { debtRulesOf, uniqueCausesOf, verdictOf };
