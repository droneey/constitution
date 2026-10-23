import { Level } from '#/kernel/constants';

import type { ConfigOverride, ProjectConfig } from '../../../entities';
import { WarningCode } from '../../../entities';
import type { ProjectModel, Scope } from './project-model.utils';
import { kidsOf } from './project-model.utils';
import type { WarningLog } from './warning-log.utils';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

interface Lowering {
  // the overrides that hold, in the order constitution.yaml lists them
  readonly live: readonly ConfigOverride[];
  // per scope, the rules its own overrides lower
  readonly lowered: ReadonlyMap<number, ReadonlySet<string>>;
  // per rule, the levels the overrides that lower it set, with where and through which rule
  readonly notes: ReadonlyMap<string, string>;
}

const missingOf = (override: ConfigOverride): string =>
  [
    override.rule === '' ? 'rule' : '',
    override.level === '' ? 'level' : '',
    override.reason === '' ? 'reason' : '',
  ]
    .filter((field) => field !== '')
    .join(', ');

// The problem that keeps an override from holding, or undefined when it holds.
const problemOf = (input: {
  model: ProjectModel;
  override: ConfigOverride;
  today: string;
}):
  | {
      code: WarningCode;
      message: string;
    }
  | undefined => {
  const { override } = input;
  const missing = missingOf(override);

  if (missing !== '') {
    return {
      code: WarningCode.Config,
      message: `the override on line ${override.line} has no ${missing} — complete it or remove it`,
    };
  }

  if (override.level !== Level.Should && override.level !== Level.May) {
    return {
      code: WarningCode.Config,
      message: `the override of ${override.rule} sets the level ${override.level} — write SHOULD or MAY`,
    };
  }

  if (override.until !== '' && !DATE.test(override.until)) {
    return {
      code: WarningCode.Config,
      message: `the override of ${override.rule} has until ${override.until} — write a date as YYYY-MM-DD`,
    };
  }

  if (!input.model.rules.has(override.rule)) {
    return {
      code: WarningCode.Override,
      message: `${override.rule} names no rule — check the slug`,
    };
  }

  return override.until !== '' && override.until < input.today
    ? {
        code: WarningCode.Override,
        message: `${override.rule} expired on ${override.until} — renew or remove it`,
      }
    : undefined;
};

// An override lowers its rule and, through the chain of arrows, every rule that takes its level
// from it.
const applyOverrides = (input: {
  config: ProjectConfig;
  log: WarningLog;
  model: ProjectModel;
  today: string;
}): Lowering => {
  const lowered = new Map<number, Set<string>>();
  const notes = new Map<string, string>();
  const live: ConfigOverride[] = [];
  const note = (noted: { rule: string; text: string }): void => {
    const before = notes.get(noted.rule);

    notes.set(noted.rule, before === undefined ? noted.text : `${before}; ${noted.text}`);
  };

  for (const override of input.config.overrides) {
    const problem = problemOf({
      model: input.model,
      override,
      today: input.today,
    });

    if (problem !== undefined) {
      input.log.add(problem);
      continue;
    }

    // a package's override lowers its rules there; any other, in the whole repository
    const index = input.config.apps.indexOf(override.app) + 1;
    const where = index === 0 ? '' : ` in ${override.app}`;
    const set = lowered.get(index) ?? new Set<string>();
    const cascaded = new Set<string>();
    const lowerBelow = (parent: string): void => {
      for (const kid of kidsOf({
        model: input.model,
        parent,
      })) {
        if (!cascaded.has(kid)) {
          cascaded.add(kid);
          set.add(kid);
          note({
            rule: kid,
            text: `${override.level}${where} via ${override.rule}`,
          });
          lowerBelow(kid);
        }
      }
    };

    lowered.set(index, set);
    set.add(override.rule);
    note({
      rule: override.rule,
      text: `${override.level}${where}`,
    });
    live.push(override);
    lowerBelow(override.rule);
  }

  return {
    live,
    lowered,
    notes,
  };
};

const isLowered = (input: { lowering: Lowering; rule: string; scope: Scope }): boolean =>
  input.lowering.lowered.get(0)?.has(input.rule) === true ||
  input.lowering.lowered.get(input.scope.index)?.has(input.rule) === true;

export type { Lowering };
export { applyOverrides, isLowered };
