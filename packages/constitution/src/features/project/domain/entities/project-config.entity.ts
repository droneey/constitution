import type { ConfigReadStatus } from '#/kernel/entities';
import { attempted, isRangeError } from '#/kernel/utils';
import { PackPath, UnitPath } from '#/kernel/value-objects';

/** The keys of constitution.yaml. */
enum ConfigKey {
  Name = 'name',
  Axes = 'axes',
  Domains = 'domains',
  Platforms = 'platforms',
  Languages = 'languages',
  Implementations = 'implementations',
  Packs = 'packs',
  Overrides = 'overrides',
}

// The keys whose value is a list, in the order a file writes them.
const LIST_KEYS = [
  ConfigKey.Axes,
  ConfigKey.Domains,
  ConfigKey.Platforms,
  ConfigKey.Languages,
  ConfigKey.Implementations,
  ConfigKey.Packs,
] as const satisfies readonly ConfigKey[];

interface ConfigItem {
  readonly key: string;
  readonly text: string;
}

interface ConfigOverride {
  readonly level?: string;
  readonly line: number;
  readonly reason?: string;
  readonly rule?: string;
  readonly until?: string;
}

const UNTIL_FORM = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_FIELDS = [
  'rule',
  'level',
  'reason',
] as const satisfies readonly (keyof ConfigOverride)[];

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

/** The fields an override must give and leaves out, in the order they are written. */
const missingFieldsOf = (override: ConfigOverride): readonly string[] =>
  REQUIRED_FIELDS.filter((field) => override[field] === undefined);

/** The calendar date until names, or undefined when it is no date written YYYY-MM-DD. */
const expiryOf = (until: string): Temporal.PlainDate | undefined =>
  UNTIL_FORM.test(until)
    ? attempted({
        effect: () => Temporal.PlainDate.from(until),
        isRecognised: isRangeError,
      })
    : undefined;

const ConfigOverride = {
  create: createOverride,
  expiryOf,
  missingFieldsOf,
} as const;

// One constitution.yaml as the fixed subset of YAML its grammar allows reads it, in the order it is
// written.
interface UnitConfig {
  // the keys of the lists left empty
  readonly empties: readonly string[];
  readonly items: readonly ConfigItem[];
  // every top-level key, those the grammar does not know included
  readonly keys: readonly string[];
  // the keys written as lists
  readonly lists: readonly string[];
  // the value of name, absent when it is left out or empty
  readonly name?: string;
  readonly overrides: readonly ConfigOverride[];
}

interface DeclaredUnit {
  readonly config: UnitConfig;
  readonly path: UnitPath;
}

// Why a member of the workspace declares nothing.
enum MemberProblem {
  Missing = 'missing',
  Unreadable = 'unreadable',
  Unparsed = 'unparsed',
}

interface UnreadMember {
  // the line, from 1, the grammar stops at, for a file that does not parse
  readonly line?: number;
  readonly path: UnitPath;
  readonly problem: MemberProblem;
}

// What a project declares: the repository's constitution.yaml, then each member's of its workspace
// in the order of their paths; nothing passes from one to another.
interface ProjectConfig {
  readonly units: readonly [
    DeclaredUnit,
    ...DeclaredUnit[],
  ];
  // the members whose constitution.yaml is missing or cannot be read
  readonly unread: readonly UnreadMember[];
}

type ConfigRead =
  | {
      readonly config: UnitConfig;
      readonly status: ConfigReadStatus.Parsed;
    }
  | {
      // the line, from 1, the grammar stops at
      readonly line: number;
      readonly status: ConfigReadStatus.Unparsed;
    };

// The packs a unit lists, each by its path from the repository, which the block set reads it at:
// as the repository writes it, a member's from the member's folder.
const packsListedBy = (unit: DeclaredUnit): readonly PackPath[] =>
  unit.config.items
    .filter((listed) => listed.key === ConfigKey.Packs && PackPath.is(listed.text))
    .map((listed) => {
      const pack = PackPath.create(listed.text);

      return UnitPath.isRepository(unit.path) ? pack : PackPath.fromFolder(pack, unit.path);
    });

const eachOnce = (packs: readonly PackPath[]): readonly PackPath[] =>
  packs.filter((pack, index) => packs.findIndex((first) => PackPath.equals(first, pack)) === index);

// The packs the units list, each once, in the order they are first listed.
const packsOf = (config: ProjectConfig): readonly PackPath[] =>
  eachOnce(config.units.flatMap(packsListedBy));

const listsPack = (unit: DeclaredUnit, pack: PackPath): boolean =>
  packsListedBy(unit).some((listed) => PackPath.equals(listed, pack));

const DeclaredUnit = {
  listsPack,
  /** the packs the unit lists, each once, in the order it lists them */
  packsOf: (unit: DeclaredUnit): readonly PackPath[] => eachOnce(packsListedBy(unit)),
} as const;

const ProjectConfig = {
  packsOf,
} as const;

export type { ConfigItem, ConfigRead, UnreadMember };
export { ConfigKey, ConfigOverride, DeclaredUnit, LIST_KEYS, MemberProblem, ProjectConfig };
