import { LOWERED_LEVELS } from '#/kernel/constants';
import type { Lowering, ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { dayOf } from '#/kernel/utils';
import type { RuleSlug, UnitPath } from '#/kernel/value-objects';

import { ProjectModel } from '../../../../../block-set/entities';
import type { ProjectConfig } from '../../../../../project-config/entities';
import { ConfigOverride } from '../../../../../project-config/entities';
import type { AppliedOverrides, ListedOverride } from '../../../../../resolution/entities';

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
    writtenUntil === undefined ? undefined : dayOf(writtenUntil);

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

const loweredBy = (input: {
  model: ProjectModel;
  override: ListedOverride;
}): readonly {
  readonly lowering: Lowering;
  readonly rule: RuleSlug;
}[] => {
  const { override } = input;

  const lowering = (via?: RuleSlug): Lowering => ({
    level: override.level,
    unit: override.unit,
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
  readonly model: ProjectModel;
  readonly today: Temporal.PlainDate;
}

interface OverridesApplied {
  readonly applied: AppliedOverrides;
  readonly warnings: readonly ProjectWarning[];
}

const applyOverrides = (input: ApplyOverridesInput): OverridesApplied => {
  const checked = input.config.units.flatMap((unit) =>
    unit.config.overrides.map((override) =>
      checkOverride({
        model: input.model,
        override,
        today: input.today,
        unit: unit.path,
      }),
    ),
  );
  const live = checked.flatMap((check) =>
    check.status === OverrideStatus.Live
      ? [
          check.override,
        ]
      : [],
  );
  const lowered = live.flatMap((override) =>
    loweredBy({
      model: input.model,
      override,
    }),
  );

  return {
    applied: {
      live,
      loweredIn: new Map(
        [
          ...Map.groupBy(lowered, ({ lowering }) => lowering.unit),
        ].map(([unit, own]) => [
          unit,
          new Set(own.map(({ rule }) => rule)),
        ]),
      ),
      lowerings: new Map(
        [
          ...Map.groupBy(lowered, ({ rule }) => rule),
        ].map(([rule, own]) => [
          rule,
          own.map(({ lowering }) => lowering),
        ]),
      ),
    },
    warnings: checked.flatMap((check) =>
      check.status === OverrideStatus.Refused
        ? [
            check.warning,
          ]
        : [],
    ),
  };
};

export { applyOverrides };
