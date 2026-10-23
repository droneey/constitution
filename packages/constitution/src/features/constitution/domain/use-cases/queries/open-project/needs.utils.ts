import { Level } from '#/kernel/constants';

import type { CatalogueAnswer, CatalogueRule } from '../../../entities';
import { WarningCode } from '../../../entities';
import type { Lowering } from './overrides.utils';
import { isLowered } from './overrides.utils';
import type { ProjectModel, Scope } from './project-model.utils';
import { heirsOf, keyOfLayer, whereOf } from './project-model.utils';
import type { WarningLog } from './warning-log.utils';

const NOT_MET = 'no';

const isActiveRule = (input: { rule: CatalogueRule; scope: Scope }): boolean =>
  input.scope.axes.has(input.rule.axis) &&
  input.scope.blocks.has(input.rule.block) &&
  (input.rule.with === undefined || input.scope.blocks.has(input.rule.with));

// A package warns only of what it adds to the repository's blocks.
const checkRequires = (input: {
  log: WarningLog;
  model: ProjectModel;
  repository: Scope;
  scope: Scope;
}): void => {
  const { log, model, repository, scope } = input;

  for (const block of model.blocks) {
    if (!scope.blocks.has(block.id) || (scope.index > 0 && repository.blocks.has(block.id))) {
      continue;
    }

    for (const required of block.requires) {
      const need = model.byId.get(required);

      if (scope.blocks.has(required) || need === undefined) {
        continue;
      }

      log.add({
        code: WarningCode.Missing,
        message: `${block.id}${whereOf(scope)} needs ${required} — add ${
          need.isAbstract
            ? heirsOf({
                id: required,
                model,
              })
            : required
        } to ${keyOfLayer(need.layer)}`,
      });
    }
  }
};

// A requirement a library does not meet matters where the MUST rule it names is active and kept.
const unmetOf = (input: {
  answers: readonly CatalogueAnswer[];
  lowering: Lowering;
  model: ProjectModel;
  scope: Scope;
}): ReadonlySet<CatalogueAnswer> =>
  new Set(
    input.answers.filter((answer) => {
      const rule = input.model.rules.get(answer.requirement);

      return (
        answer.met === NOT_MET &&
        input.scope.blocks.has(answer.block) &&
        rule !== undefined &&
        rule.level === Level.Must &&
        isActiveRule({
          rule,
          scope: input.scope,
        }) &&
        !isLowered({
          lowering: input.lowering,
          rule: answer.requirement,
          scope: input.scope,
        })
      );
    }),
  );

// A package warns only of what the repository does not; the repository passes none.
const checkAnswers = (input: {
  answers: readonly CatalogueAnswer[];
  log: WarningLog;
  lowering: Lowering;
  model: ProjectModel;
  scope: Scope;
  unmetInRepository: ReadonlySet<CatalogueAnswer>;
}): ReadonlySet<CatalogueAnswer> => {
  const unmet = unmetOf(input);

  for (const answer of input.answers) {
    if (!unmet.has(answer) || input.unmetInRepository.has(answer)) {
      continue;
    }

    input.log.add({
      code: WarningCode.NotMet,
      message: `${answer.block}${whereOf(input.scope)} does not meet ${answer.requirement} — see its Requirements table`,
    });
  }

  return unmet;
};

export { checkAnswers, checkRequires, isActiveRule };
