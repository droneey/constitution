import type { Axis } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';

enum PresetsCode {
  CatalogueMisplaced = 'catalogue-misplaced',
  CatalogueUnparsed = 'catalogue-unparsed',
  EntryMisshapen = 'entry-misshapen',
  UnknownReader = 'unknown-reader',
  UnknownBlock = 'unknown-block',
  UnknownRule = 'unknown-rule',
  UnknownLanguage = 'unknown-language',
  RuleOfAnotherBlock = 'rule-of-another-block',
  EntryMisplaced = 'entry-misplaced',
  EntryOffItsAxis = 'entry-off-its-axis',
  FileOutsideItsUnit = 'file-outside-its-unit',
  UnknownFact = 'unknown-fact',
  UnknownRole = 'unknown-role',
  HandTypedRole = 'hand-typed-role',
  RoleOffItsAxis = 'role-off-its-axis',
  MembersOutsideList = 'members-outside-a-list',
  MissingReleaseFile = 'missing-release-file',
  PluginUnreferenced = 'plugin-unreferenced',
  PluginNamesNoRule = 'plugin-names-no-rule',
  Clash = 'clash',
  TwoReplacers = 'two-replacers',
  MissingSlot = 'missing-slot',
  SlotInNoList = 'slot-in-no-list',
  MissingName = 'missing-name',
  MissingConstitution = 'missing-constitution',
  Loosened = 'loosened',
  FileUnparsed = 'file-unparsed',
  LockUnparsed = 'lock-unparsed',
}

interface EntryNamed {
  readonly block: string;
  readonly rule: string;
}

interface SettingNamed {
  /** its keys joined by dots */
  readonly setting: string;
}

interface SourcesNamed extends SettingNamed {
  readonly sources: readonly string[];
}

interface SlotNamed extends SettingNamed {
  readonly slot: string;
}

interface PresetsDetails {
  readonly [PresetsCode.CatalogueMisplaced]: object;
  readonly [PresetsCode.CatalogueUnparsed]: {
    /** from 1; absent when the parser names none */
    readonly line?: number;
  };
  readonly [PresetsCode.EntryMisshapen]: {
    /** the keys down to the one whose value is no map of the entry's next key */
    readonly keys: readonly string[];
  };
  readonly [PresetsCode.UnknownReader]: {
    readonly reader: string;
  };
  readonly [PresetsCode.UnknownBlock]: {
    readonly block: string;
  };
  readonly [PresetsCode.UnknownRule]: EntryNamed;
  readonly [PresetsCode.UnknownLanguage]: EntryNamed & {
    readonly language: string;
  };
  readonly [PresetsCode.RuleOfAnotherBlock]: EntryNamed & {
    readonly owner: string;
  };
  readonly [PresetsCode.EntryMisplaced]: EntryNamed & {
    /** the catalogue's path under presets/ */
    readonly belongs: string;
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
  readonly [PresetsCode.RoleOffItsAxis]: EntryNamed & {
    readonly role: string;
    readonly termAxis: Axis;
  };
  readonly [PresetsCode.MembersOutsideList]: EntryNamed;
  readonly [PresetsCode.MissingReleaseFile]: EntryNamed & {
    /** the file's path from the release */
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
  readonly [PresetsCode.MissingName]: object;
  readonly [PresetsCode.MissingConstitution]: object;
  readonly [PresetsCode.Loosened]: SettingNamed & {
    /** the value the catalogues give the setting, as JSON writes it */
    readonly wanted: string;
  };
  readonly [PresetsCode.FileUnparsed]: object;
  readonly [PresetsCode.LockUnparsed]: object;
}

type PresetsFinding = FindingOf<PresetsDetails>;

type PresetsProblem = ProblemOf<PresetsDetails>;

type MergeProblem = Extract<
  PresetsProblem,
  {
    readonly code:
      | PresetsCode.Clash
      | PresetsCode.MissingSlot
      | PresetsCode.SlotInNoList
      | PresetsCode.TwoReplacers;
  }
>;

export type { EntryNamed, MergeProblem, PresetsDetails, PresetsFinding, PresetsProblem };
export { PresetsCode };
