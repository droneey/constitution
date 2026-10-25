import { LOWERED_LEVELS } from '#/kernel/constants';
import type { ListedOverride, ProjectWarning } from '#/kernel/entities';
import { Lowering, WarningKind } from '#/kernel/entities';
import type { RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { ProjectConfig } from '../../../../../../../entities';
import { AppliedOverrides, ConfigOverride, ProjectModel } from '../../../../../../../entities';
import type { WarningLog } from '../../shared/warning-log';

enum OverrideStatus {
  Live = 'live',
  Refused = 'refused',
}

type OverrideCheck =
  | {
      readonly override: ListedOverride;
      readonly status: OverrideStatus.Live;
    }
  | {
      readonly status: OverrideStatus.Refused;
      readonly warning: ProjectWarning;
    };

const refused = (warning: ProjectWarning): OverrideCheck => ({
  status: OverrideStatus.Refused,
  warning,
});

// The override as it holds in its unit, or the warning that says why it does not.
const checkOverride = (input: {
  model: ProjectModel;
  override: ConfigOverride;
  today: Temporal.PlainDate;
  unit: UnitPath;
}): OverrideCheck => {
  const { override } = input;
  const { level: written, reason, rule: named, until: writtenUntil } = override;

  if (named === undefined || written === undefined || reason === undefined) {
    return refused({
      details: {
        line: override.line,
        missing: ConfigOverride.missingFieldsOf(override),
      },
      kind: WarningKind.OverrideIncomplete,
    });
  }

  const level = LOWERED_LEVELS.find((lowered) => lowered === written);

  if (level === undefined) {
    return refused({
      details: {
        level: written,
        rule: named,
      },
      kind: WarningKind.OverrideLevelNotLowered,
    });
  }

  const until =
    // Stryker disable next-line ConditionalExpression: the test only narrows the type; no date reads from an absent until
    writtenUntil === undefined ? undefined : ConfigOverride.expiryOf(writtenUntil);

  if (writtenUntil !== undefined && until === undefined) {
    return refused({
      details: {
        rule: named,
        until: writtenUntil,
      },
      kind: WarningKind.OverrideUntilMalformed,
    });
  }

  const rule = ProjectModel.ruleNamed(input.model, named);

  if (rule === undefined) {
    return refused({
      details: {
        rule: named,
      },
      kind: WarningKind.OverrideNamesNoRule,
    });
  }

  if (until !== undefined && Temporal.PlainDate.compare(until, input.today) < 0) {
    return refused({
      details: {
        rule: named,
        until: until.toString(),
      },
      kind: WarningKind.OverrideExpired,
    });
  }

  return {
    override: {
      level,
      rule: rule.slug,
      unit: input.unit,
      ...(until === undefined
        ? {}
        : {
            until,
          }),
    },
    status: OverrideStatus.Live,
  };
};

// The rules an override lowers, each with how: its own rule, then through the chain of arrows every
// rule that takes its level from it, each once.
const loweredBy = (input: {
  model: ProjectModel;
  override: ListedOverride;
}): readonly {
  readonly lowering: Lowering;
  readonly rule: RuleSlug;
}[] => {
  const { override } = input;

  const lowering = (via?: RuleSlug): Lowering =>
    Lowering.create({
      level: override.level,
      unit: override.unit,
      // Stryker disable next-line ConditionalExpression: create leaves an absent via out
      ...(via === undefined
        ? {}
        : {
            via,
          }),
    });

  const cascaded = new Set<RuleSlug>();

  const below = (rule: RuleSlug): readonly RuleSlug[] =>
    ProjectModel.inheritorsOf(input.model, rule).flatMap((inheritor) => {
      if (cascaded.has(inheritor)) {
        return [];
      }

      cascaded.add(inheritor);

      return [
        inheritor,
        ...below(inheritor),
      ];
    });

  return [
    {
      lowering: lowering(),
      rule: override.rule,
    },
    ...below(override.rule).map((rule) => ({
      lowering: lowering(override.rule),
      rule,
    })),
  ];
};

interface ApplyOverridesInput {
  readonly config: ProjectConfig;
  readonly log: WarningLog;
  readonly model: ProjectModel;
  readonly today: Temporal.PlainDate;
}

// An override lowers its rule and, through the chain of arrows, every rule that takes its level
// from it, in the unit whose constitution.yaml lists it alone.
const applyOverrides = (input: ApplyOverridesInput): AppliedOverrides => {
  const loweredIn = new Map<UnitPath, Set<RuleSlug>>();
  const lowerings = new Map<RuleSlug, Lowering[]>();
  const live: ListedOverride[] = [];

  for (const unit of input.config.units) {
    for (const override of unit.config.overrides) {
      const checked = checkOverride({
        model: input.model,
        override,
        today: input.today,
        unit: unit.path,
      });

      if (checked.status === OverrideStatus.Refused) {
        input.log.add(checked.warning);

        continue;
      }

      const liveOverride = checked.override;
      const lowered = loweredIn.get(unit.path) ?? new Set<RuleSlug>();

      loweredIn.set(unit.path, lowered);
      live.push(liveOverride);

      for (const { lowering, rule } of loweredBy({
        model: input.model,
        override: liveOverride,
      })) {
        lowered.add(rule);
        lowerings.set(rule, [
          ...(lowerings.get(rule) ?? []),
          lowering,
        ]);
      }
    }
  }

  return AppliedOverrides.create({
    live,
    loweredIn,
    lowerings,
  });
};

export { applyOverrides };
