import { sessionsFolderInProject } from '#/kernel/constants';
import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type { ActiveRulesSource } from '../../../contracts';
import type { GateCommandRepository, RulesPart } from '../../../contracts/repositories/commands';
import type { AgentInSession } from '../../../entities';
import { DebtKind } from '../../../entities';

interface ReadRange {
  readonly limit?: number;
  readonly offset?: number;
}

interface RecordReadInput extends AgentInSession {
  readonly gates: GateCommandRepository;
  readonly path: AbsolutePath;
  readonly range: ReadRange;
  readonly source: ActiveRulesSource;
}

const FIRST_LINE = 1;

const isWhole = (range: ReadRange, lineCount: number): boolean =>
  (range.offset ?? FIRST_LINE) <= FIRST_LINE && (range.limit ?? lineCount) >= lineCount;

const isGateOwnFile = (input: { paths: readonly AbsolutePath[]; place: ProjectPlace }): boolean => {
  const folders = [
    input.place.releaseFolderPath,
    AbsolutePath.join(input.place.repositoryFolderPath, sessionsFolderInProject),
  ];

  return input.paths.some((path) =>
    folders.some((folder) => RepositoryRelativePath.fromAbsolute(folder, path) !== undefined),
  );
};

const payPartRead = (
  input: RecordReadInput & {
    part: RulesPart;
  },
): void => {
  if (!isWhole(input.range, input.part.lineCount)) {
    return;
  }

  input.gates.addRulesRead({
    agent: input.agent,
    rules: input.part.rules,
    session: input.session,
  });
};

const oweRulesOfCodeRead = (input: RecordReadInput): void => {
  const { gates } = input;
  const realPath = input.source.realPathOf(input.path);
  const place = input.source.findProjectAround(AbsolutePath.parentOf(realPath));

  if (
    place === undefined ||
    isGateOwnFile({
      paths: [
        input.path,
        realPath,
      ],
      place,
    })
  ) {
    return;
  }

  const isOwed = gates
    .debts(input)
    .some((debt) => debt.kind === DebtKind.Read && debt.path === realPath);

  if (isOwed) {
    return;
  }

  gates.addDebts({
    ...input,
    debts: [
      {
        kind: DebtKind.Read,
        path: realPath,
      },
    ],
  });
};

const recordRead = (input: RecordReadInput): void => {
  const part = input.gates.partOf({
    path: input.path,
    session: input.session,
  });

  if (part === undefined) {
    oweRulesOfCodeRead(input);

    return;
  }

  payPartRead({
    ...input,
    part,
  });
};

export type { ReadRange };
export { recordRead };
