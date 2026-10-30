import type { ListKey, RequiredConfigKey } from '#/kernel/constants';
import { ConfigKey, LAYERS, Layer } from '#/kernel/constants';
import type { ConfigReadStatus, ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { PackPath, repositoryUnit, UnitPath } from '#/kernel/value-objects';

type ListedLayer = Exclude<Layer, Layer.Core>;

// Stryker disable next-line ConditionalExpression: the guard only types the layers; core has no key, so no key finds it either way
const isListedLayer = (layer: Layer): layer is ListedLayer => layer !== Layer.Core;

// Stryker disable next-line MethodExpression: the filter only types the layers; core has no key, so no key finds it either way
const listedLayers = LAYERS.filter(isListedLayer);

const LAYER_KEYS = {
  [Layer.Domain]: ConfigKey.Domains,
  [Layer.Implementation]: ConfigKey.Implementations,
  [Layer.Language]: ConfigKey.Languages,
  [Layer.Platform]: ConfigKey.Platforms,
} as const satisfies Readonly<Record<ListedLayer, ConfigKey>>;

interface ConfigItem {
  readonly key: ListKey;
  readonly text: string;
}

enum OverrideField {
  Rule = 'rule',
  Level = 'level',
  Reason = 'reason',
  Until = 'until',
}

interface ConfigOverride {
  readonly line: number;
  readonly [OverrideField.Level]?: string;
  readonly [OverrideField.Reason]?: string;
  readonly [OverrideField.Rule]?: string;
  readonly [OverrideField.Until]?: string;
}

const REQUIRED_FIELDS = [
  OverrideField.Rule,
  OverrideField.Level,
  OverrideField.Reason,
] as const satisfies readonly OverrideField[];

const createOverride = (input: {
  readonly level: string | undefined;
  readonly line: number;
  readonly reason: string | undefined;
  readonly rule: string | undefined;
  readonly until: string | undefined;
}): ConfigOverride => ({
  ...(input.level === undefined
    ? {}
    : {
        level: input.level,
      }),
  line: input.line,
  ...(input.reason === undefined
    ? {}
    : {
        reason: input.reason,
      }),
  ...(input.rule === undefined
    ? {}
    : {
        rule: input.rule,
      }),
  ...(input.until === undefined
    ? {}
    : {
        until: input.until,
      }),
});

const missingFieldsOf = (override: ConfigOverride): readonly string[] =>
  REQUIRED_FIELDS.filter((field) => override[field] === undefined);

const ConfigOverride = {
  create: createOverride,
  missingFieldsOf,
} as const;

interface UnitConfig {
  readonly empties: readonly RequiredConfigKey[];
  readonly items: readonly ConfigItem[];
  readonly keys: readonly string[];
  readonly name?: string;
  readonly overrides: readonly ConfigOverride[];
}

interface DeclaredUnit {
  readonly config: UnitConfig;
  readonly path: UnitPath;
}

interface ParseFailure {
  readonly lines: readonly number[];
}

enum MemberProblem {
  Missing = 'missing',
  Unreadable = 'unreadable',
  Unparsed = 'unparsed',
}

type UnreadMember =
  | {
      readonly path: UnitPath;
      readonly problem: MemberProblem.Missing | MemberProblem.Unreadable;
    }
  | (ParseFailure & {
      readonly path: UnitPath;
      readonly problem: MemberProblem.Unparsed;
    });

const warningOf = (member: UnreadMember): ProjectWarning => {
  switch (member.problem) {
    case MemberProblem.Missing:
      return {
        details: {
          member: member.path,
        },
        kind: WarningKind.MemberWithoutConfig,
      };
    case MemberProblem.Unparsed:
      return {
        details: {
          lines: member.lines,
          member: member.path,
        },
        kind: WarningKind.MemberConfigUnparsed,
      };
    case MemberProblem.Unreadable:
      return {
        details: {
          member: member.path,
        },
        kind: WarningKind.MemberConfigUnreadable,
      };
    // Stryker disable next-line ConditionalExpression: no problem reaches the default, which only the compiler reads
    default:
      return member satisfies never;
  }
};

const UnreadMember = {
  warningOf,
} as const;

interface ProjectConfig {
  readonly units: readonly [
    DeclaredUnit,
    ...DeclaredUnit[],
  ];
  readonly unread: readonly UnreadMember[];
}

type ConfigRead =
  | {
      readonly config: UnitConfig;
      readonly status: ConfigReadStatus.Parsed;
    }
  | (ParseFailure & {
      readonly status: ConfigReadStatus.Unparsed;
    });

const packsListedBy = (unit: DeclaredUnit): readonly PackPath[] =>
  unit.config.items
    .filter((listed) => listed.key === ConfigKey.Packs && PackPath.is(listed.text))
    .map((listed) => {
      const pack = PackPath.create(listed.text);

      return UnitPath.isRepository(unit.path) ? pack : PackPath.fromFolder(pack, unit.path);
    });

const eachOnce = (packs: readonly PackPath[]): readonly PackPath[] =>
  packs.filter((pack, index) => packs.findIndex((first) => PackPath.equals(first, pack)) === index);

const packsOf = (config: ProjectConfig): readonly PackPath[] =>
  eachOnce(config.units.flatMap(packsListedBy));

const listsPack = (unit: DeclaredUnit, pack: PackPath): boolean =>
  packsListedBy(unit).some((listed) => PackPath.equals(listed, pack));

const unitPacksOf = (unit: DeclaredUnit): readonly PackPath[] => eachOnce(packsListedBy(unit));

const DeclaredUnit = {
  listsPack,
  packsOf: unitPacksOf,
} as const;

const layerOfKey = (key: ListKey): ListedLayer | undefined =>
  listedLayers.find((layer) => LAYER_KEYS[layer] === key);

/** The repository's own constitution.yaml leads, then each member's that was read. */
const create = (input: {
  members: readonly DeclaredUnit[];
  root: UnitConfig;
  unread: readonly UnreadMember[];
}): ProjectConfig => ({
  units: [
    {
      config: input.root,
      path: repositoryUnit,
    },
    ...input.members,
  ],
  unread: input.unread,
});

const ProjectConfig = {
  create,
  packsOf,
} as const;

export type { ConfigItem, ConfigRead, ParseFailure };
export {
  ConfigOverride,
  DeclaredUnit,
  LAYER_KEYS,
  layerOfKey,
  MemberProblem,
  OverrideField,
  ProjectConfig,
  UnreadMember,
};
