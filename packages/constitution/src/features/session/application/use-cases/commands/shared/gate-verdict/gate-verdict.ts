import { sessionsFolderInProject } from '#/kernel/constants';
import { firstBy } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';

import type { GateVerdict, RuleDebt, RulesRead } from '../../../../../domain/gate/entities';
import {
  DebtKind,
  GateCause,
  GateCauseKind,
  GateVerdictKind,
  OwedReading,
  TargetKind,
} from '../../../../../domain/gate/entities';
import { RuleSetHash } from '../../../../../domain/gate/value-objects';
import type { AgentInSession } from '../../../../../domain/session/entities';
import type { TextHasher, WorkingTree } from '../../../../contracts';
import { IgnoreStatus } from '../../../../contracts';
import type { GateRepository } from '../../../../contracts/repositories/commands';
import type { ProjectRules, RulesOwedFor, TargetRules } from '../owe-rules';
import { recordRefusalOrPass } from '../refusal-streak';

interface DebtRules {
  readonly debt: RuleDebt;
  readonly owed: TargetRules;
}

interface DebtRulesInput extends AgentInSession {
  readonly gateRepository: GateRepository;
  readonly owedFor: RulesOwedFor;
}

interface GatePorts extends AgentInSession {
  readonly gateRepository: GateRepository;
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
  readonly unread: OwedReading;
}

const uniqueCausesOf = (causes: readonly GateCause[]): readonly GateCause[] => [
  ...firstBy(causes, GateCause.keyOf).values(),
];

const debtRulesOf = (input: DebtRulesInput): readonly DebtRules[] =>
  input.gateRepository.debts(input).map((debt) => ({
    debt,
    owed: input.owedFor({
      kind: TargetKind.File,
      path: debt.path,
    }),
  }));

const nothingOwed: OwedReading = {
  definitions: [],
  rules: [],
};

const unreadIn = (project: ProjectRules | undefined, read: RulesRead): OwedReading =>
  OwedReading.unreadOf(project ?? nothingOwed, read);

const isPaid = (debt: DebtRules, read: RulesRead): boolean =>
  debt.owed.causes.length === 0 && OwedReading.isEmpty(unreadIn(debt.owed.project, read));

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
  input.gateRepository.settleDebts({
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
    .filter((project) => !OwedReading.isEmpty(project.unread));

const isSessionsFolderUnignored = (input: {
  projectFolderPath: AbsolutePath;
  workingTree: WorkingTree;
}): boolean => {
  const sessionsFolder = AbsolutePath.join(input.projectFolderPath, sessionsFolderInProject);
  const told = input.workingTree.ignoredAmong({
    paths: [
      sessionsFolder,
    ],
    repositoryFolderPath: input.projectFolderPath,
  });

  return told.status === IgnoreStatus.Told && !told.paths.has(sessionsFolder);
};

const refusedOf = (input: {
  debts: readonly DebtRules[];
  parts: readonly AbsolutePath[];
  projectFolderPath: AbsolutePath;
  read: RulesRead;
  unread: OwedReading;
  workingTree: WorkingTree;
}): GateVerdict => ({
  changedByCommands: input.debts
    .filter(
      (debt) =>
        debt.debt.kind === DebtKind.Changed &&
        !OwedReading.isEmpty(unreadIn(debt.owed.project, input.read)),
    )
    .map((debt) => debt.debt.path),
  kind: GateVerdictKind.Refused,
  parts: input.parts,
  shouldIgnoreParts: isSessionsFolderUnignored(input),
  unread: OwedReading.countOf(input.unread),
});

const unreadVerdictOf = (
  input: VerdictInput & {
    projectFolderPath: AbsolutePath;
    read: RulesRead;
    unread: OwedReading;
  },
): GateVerdict => {
  const { unread } = input;
  const unreadText = OwedReading.hashedTextOf(unread);
  const parts = input.gateRepository.writeParts({
    ...unread,
    projectFolderPath: input.projectFolderPath,
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
      unread: OwedReading.countOf(unread),
    };
  }

  return refusedOf({
    ...input,
    parts,
  });
};

const verdictOf = (input: VerdictInput): GateVerdict => {
  if (input.closing.length > 0) {
    return closedOf({
      ...input,
      causes: input.closing,
    });
  }

  const read = input.gateRepository.rulesRead(input);

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
    unread: OwedReading.joinedOf(projects.map((each) => each.unread)),
  });
};

export type { DebtRules, GatePorts };
export { debtRulesOf, uniqueCausesOf, verdictOf };
