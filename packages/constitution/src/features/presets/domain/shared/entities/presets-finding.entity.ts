import type { Axis } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import type { BlockId } from '#/kernel/value-objects';

import type { PresetFilePath } from '../value-objects';

enum PresetsCode {
  PresetFileMisplaced = 'preset-file-misplaced',
  PresetFileUnparsed = 'preset-file-unparsed',
  EntryMisshapen = 'entry-misshapen',
  UnknownReader = 'unknown-reader',
  UnknownBlock = 'unknown-block',
  UnknownRule = 'unknown-rule',
  UnknownLanguage = 'unknown-language',
  RuleOfAnotherBlock = 'rule-of-another-block',
  EntryMisplaced = 'entry-misplaced',
  EntryNeedsTooManyBlocks = 'entry-needs-too-many-blocks',
  EntryOffItsAxis = 'entry-off-its-axis',
  FileOutsideItsUnit = 'file-outside-its-unit',
  UnknownFact = 'unknown-fact',
  UnknownRole = 'unknown-role',
  HandTypedRole = 'hand-typed-role',
  MembersOutsideList = 'members-outside-a-list',
  SortedInUnsortableFile = 'sorted-in-unsortable-file',
  MissingDistributionFile = 'missing-distribution-file',
  PluginUnreferenced = 'plugin-unreferenced',
  PluginNamesNoRule = 'plugin-names-no-rule',
  Clash = 'clash',
  TwoReplacers = 'two-replacers',
  MissingSlot = 'missing-slot',
  SlotInNoList = 'slot-in-no-list',
  SlotPlacedTwice = 'slot-placed-twice',
  MissingName = 'missing-name',
  MissingConstitution = 'missing-constitution',
  Loosened = 'loosened',
  Missing = 'missing',
  Stale = 'stale',
  Unsorted = 'unsorted',
  FileUnparsed = 'file-unparsed',
  LockUnparsed = 'lock-unparsed',
  RunMisshapen = 'run-misshapen',
  ToolWithoutRunner = 'tool-without-runner',
}

interface EntryNamed {
  readonly block: BlockId;
  readonly rule: string;
}

interface UnreachedRole {
  readonly definers: readonly BlockId[];
  readonly role: string;
}

interface SettingNamed {
  readonly settingPath: string;
}

interface SettingsNamed {
  readonly settingPaths: readonly string[];
}

interface SourcesNamed extends SettingNamed {
  readonly sources: readonly string[];
}

interface SlotNamed extends SettingNamed {
  readonly slot: string;
}

interface PresetsDetails {
  readonly [PresetsCode.PresetFileMisplaced]: object;
  readonly [PresetsCode.PresetFileUnparsed]: {
    readonly line?: number;
  };
  readonly [PresetsCode.EntryMisshapen]: {
    readonly keys: readonly string[];
  };
  readonly [PresetsCode.UnknownReader]: {
    readonly reader: BlockId;
  };
  readonly [PresetsCode.UnknownBlock]: {
    readonly block: string;
  };
  readonly [PresetsCode.UnknownRule]: EntryNamed;
  readonly [PresetsCode.UnknownLanguage]: EntryNamed & {
    readonly language: string;
  };
  readonly [PresetsCode.RuleOfAnotherBlock]: EntryNamed & {
    readonly owner: BlockId;
  };
  readonly [PresetsCode.EntryMisplaced]: EntryNamed & {
    readonly belongs: PresetFilePath;
    readonly unneededBlocks: readonly BlockId[];
    readonly unreachedRoles: readonly UnreachedRole[];
  };
  readonly [PresetsCode.EntryNeedsTooManyBlocks]: EntryNamed & {
    readonly needed: readonly BlockId[];
  };
  readonly [PresetsCode.EntryOffItsAxis]: EntryNamed & {
    readonly ruleAxis: Axis;
  };
  readonly [PresetsCode.FileOutsideItsUnit]: EntryNamed & {
    readonly file: string;
  };
  readonly [PresetsCode.UnknownFact]: EntryNamed & {
    readonly fact: string;
  };
  readonly [PresetsCode.UnknownRole]: EntryNamed & {
    readonly role: string;
  };
  readonly [PresetsCode.HandTypedRole]: EntryNamed & {
    readonly role: string;
    readonly term: string;
  };
  readonly [PresetsCode.MembersOutsideList]: EntryNamed;
  readonly [PresetsCode.SortedInUnsortableFile]: EntryNamed &
    SettingNamed & {
      readonly file: string;
    };
  readonly [PresetsCode.MissingDistributionFile]: {
    readonly file: string;
  };
  readonly [PresetsCode.PluginUnreferenced]: object;
  readonly [PresetsCode.PluginNamesNoRule]: {
    readonly rule: string;
  };
  readonly [PresetsCode.Clash]: SourcesNamed;
  readonly [PresetsCode.TwoReplacers]: SourcesNamed;
  readonly [PresetsCode.MissingSlot]: SlotNamed;
  readonly [PresetsCode.SlotInNoList]: SlotNamed;
  readonly [PresetsCode.SlotPlacedTwice]: SlotNamed;
  readonly [PresetsCode.MissingName]: object;
  readonly [PresetsCode.MissingConstitution]: object;
  readonly [PresetsCode.Loosened]: SettingNamed & {
    readonly wanted: string;
  };
  readonly [PresetsCode.Missing]: SettingsNamed;
  readonly [PresetsCode.Stale]: SettingsNamed;
  readonly [PresetsCode.Unsorted]: SettingsNamed;
  readonly [PresetsCode.FileUnparsed]: object;
  readonly [PresetsCode.LockUnparsed]: object;
  readonly [PresetsCode.RunMisshapen]: object;
  readonly [PresetsCode.ToolWithoutRunner]: {
    readonly block: BlockId;
  };
}

type PresetsFinding = FindingOf<PresetsDetails>;

const eachOnce = (findings: readonly PresetsFinding[]): readonly PresetsFinding[] => [
  ...new Map(
    findings.map((finding) => [
      JSON.stringify(finding),
      finding,
    ]),
  ).values(),
];

const PresetsFinding = {
  eachOnce,
} as const;

type PresetsProblem = ProblemOf<PresetsDetails>;

type MergeProblem = Extract<
  PresetsProblem,
  {
    readonly code:
      | PresetsCode.Clash
      | PresetsCode.MissingSlot
      | PresetsCode.SlotInNoList
      | PresetsCode.SlotPlacedTwice
      | PresetsCode.TwoReplacers;
  }
>;

export type { EntryNamed, MergeProblem, PresetsDetails, PresetsProblem, UnreachedRole };
export { PresetsCode, PresetsFinding };
