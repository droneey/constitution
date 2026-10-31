import type { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type { ActiveRulesSource, TextHasher, WorkingTree } from '../../../contracts';
import type { GateCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentInSession, HotRule } from '../../../entities';
import { HotReminder, TargetKind } from '../../../entities';
import { rulesOwedBy } from '../shared/owe-rules';

interface RemindHotRulesInput extends AgentInSession {
  readonly changedPaths: readonly AbsolutePath[];
  readonly gates: GateCommandRepository;
  readonly hasher: TextHasher;
  readonly hotSlugs: readonly RuleSlug[];
  readonly source: ActiveRulesSource;
  readonly workingTree: WorkingTree;
}

const remindHotRules = (input: RemindHotRulesInput): readonly HotReminder[] => {
  const shown = input.gates.hotReminded(input);
  const fresh = [
    ...new Set(input.changedPaths.map(input.source.realPathOf)),
  ].filter((path) => !shown.has(path));

  if (fresh.length === 0) {
    return [];
  }

  input.gates.addHotReminded({
    ...input,
    paths: fresh,
  });

  const owedFor = rulesOwedBy(input);

  return fresh.flatMap((path) => {
    const { project, realPath } = owedFor({
      kind: TargetKind.File,
      path,
    });
    const statements = new Map(
      project?.rules.map((rule) => [
        rule.slug,
        rule.statement,
      ]),
    );
    const hot = input.hotSlugs.flatMap((slug): readonly HotRule[] => {
      const statement = statements.get(slug);

      return statement === undefined
        ? []
        : [
            {
              firstSentence: HotReminder.firstSentenceOf(statement),
              slug,
            },
          ];
    });

    return hot.length === 0
      ? []
      : [
          {
            path: realPath,
            rules: hot,
          },
        ];
  });
};

export { remindHotRules };
