import { firstBy } from '#/kernel/utils';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { GateCause } from '../../../../domain/gate/entities';
import { GateCause as Cause, OwedReading, TargetKind } from '../../../../domain/gate/entities';
import type { ActiveRulesSource, TextHasher, WorkingTree } from '../../../contracts';
import { rulesOwedBy } from '../../shared/owe-rules';

interface ReadRulesInput {
  readonly hasher: TextHasher;
  readonly paths: readonly AbsolutePath[];
  readonly source: ActiveRulesSource;
  readonly workingTree: WorkingTree;
}

interface GoverningRules {
  readonly causes: readonly GateCause[];
  readonly outside: readonly AbsolutePath[];
  readonly reading: OwedReading;
}

const readRules = (input: ReadRulesInput): GoverningRules => {
  const owedFor = rulesOwedBy(input);
  const owed = input.paths.map((path) => ({
    owed: owedFor({
      kind: TargetKind.File,
      path,
    }),
    path,
  }));

  return {
    causes: [
      ...firstBy(
        owed.flatMap((each) => each.owed.causes),
        Cause.keyOf,
      ).values(),
    ],
    outside: owed.filter((each) => each.owed.project === undefined).map((each) => each.path),
    reading: OwedReading.joinedOf(owed.flatMap((each) => each.owed.project ?? [])),
  };
};

export type { GoverningRules };
export { readRules };
