import type { Layer } from '../constants';
import type { BlockId, PackPath, RuleSlug, UnitPath } from '../value-objects';
import { SourceKind } from '../value-objects';

// The codes of a project's warnings, one for each subject a reader fixes, in the order a
// declaration's warnings are grouped.
enum WarningCode {
  Config = 'config',
  Blocks = 'blocks',
  Requirements = 'requirements',
  Overrides = 'overrides',
  Workspace = 'workspace',
  Installation = 'installation',
  Configurations = 'configurations',
  Packs = 'packs',
  Constitution = 'constitution',
}

/** What a warning says, finer than its code: each kind names its own details. */
enum WarningKind {
  MemberWithoutConfig = 'member-without-config',
  MemberConfigUnparsed = 'member-config-unparsed',
  MemberConfigUnreadable = 'member-config-unreadable',
  KeyMissing = 'key-missing',
  KeyUnknown = 'key-unknown',
  KeyEmpty = 'key-empty',
  FoundationListed = 'foundation-listed',
  AxisUnknown = 'axis-unknown',
  OverrideIncomplete = 'override-incomplete',
  OverrideLevelNotLowered = 'override-level-not-lowered',
  OverrideUntilMalformed = 'override-until-malformed',
  NameIsPath = 'name-is-path',
  NameUnknown = 'name-unknown',
  CoreListed = 'core-listed',
  BlockUnderWrongKey = 'block-under-wrong-key',
  AbstractListed = 'abstract-listed',
  PackUnlisted = 'pack-unlisted',
  PackNotInstalled = 'pack-not-installed',
  FileUnreadable = 'file-unreadable',
  RuleRepeated = 'rule-repeated',
  FrontMatterMissing = 'front-matter-missing',
  NotBlockFile = 'not-block-file',
  BlockRepeated = 'block-repeated',
  OutsideBlockFolder = 'outside-block-folder',
  FolderMisnamed = 'folder-misnamed',
  BaseNoBlock = 'base-no-block',
  BaseConcrete = 'base-concrete',
  RequiredNoBlock = 'required-no-block',
  TightensUnknownRule = 'tightens-unknown-rule',
  BlockNeeded = 'block-needed',
  RequirementNotMet = 'requirement-not-met',
  OverrideNamesNoRule = 'override-names-no-rule',
  OverrideExpired = 'override-expired',
  ConfigurationFinding = 'configuration-finding',
  ConfigurationsUnchecked = 'configurations-unchecked',
  ReleaseLinkLoops = 'release-link-loops',
}

/** A file named by its path from the repository. */
interface FileNamed {
  readonly file: string;
}

/** A key of a constitution.yaml, in the file that holds it. */
interface KeyNamed extends FileNamed {
  readonly key: string;
}

/** A name a list of a constitution.yaml gives, as it is written. */
interface NameGiven {
  readonly name: string;
}

/** The slug an override names, as it is written. */
interface OverrideNamed {
  readonly rule: string;
}

/** The block set whose own files a warning is about: the Constitution's release or a pack. */
interface SourceNamed {
  readonly source: SourceKind;
}

interface WarningDetails {
  readonly [WarningKind.MemberWithoutConfig]: {
    readonly member: UnitPath;
  };
  readonly [WarningKind.MemberConfigUnparsed]: {
    /** the line, from 1, the grammar stops at, when it says */
    readonly line?: number;
    readonly member: UnitPath;
  };
  readonly [WarningKind.MemberConfigUnreadable]: {
    readonly member: UnitPath;
  };
  readonly [WarningKind.KeyMissing]: KeyNamed;
  readonly [WarningKind.KeyUnknown]: KeyNamed;
  readonly [WarningKind.KeyEmpty]: KeyNamed;
  readonly [WarningKind.FoundationListed]: FileNamed;
  readonly [WarningKind.AxisUnknown]: {
    readonly axis: string;
  };
  readonly [WarningKind.OverrideIncomplete]: {
    readonly line: number;
    /** the fields it lacks, in the order an override writes them */
    readonly missing: readonly string[];
  };
  readonly [WarningKind.OverrideLevelNotLowered]: OverrideNamed & {
    readonly level: string;
  };
  readonly [WarningKind.OverrideUntilMalformed]: OverrideNamed & {
    readonly until: string;
  };
  readonly [WarningKind.NameIsPath]: NameGiven;
  readonly [WarningKind.NameUnknown]: NameGiven;
  readonly [WarningKind.CoreListed]: {
    readonly key: string;
  };
  readonly [WarningKind.BlockUnderWrongKey]: NameGiven & {
    readonly key: string;
    readonly layer: Layer;
    /** the key that lists blocks of its layer */
    readonly toKey: string;
  };
  readonly [WarningKind.AbstractListed]: NameGiven & {
    /** the blocks that extend it, which a unit lists in its place */
    readonly heirs: readonly BlockId[];
  };
  readonly [WarningKind.PackUnlisted]: FileNamed &
    NameGiven & {
      readonly pack: PackPath;
    };
  readonly [WarningKind.PackNotInstalled]: {
    /** the pack's folder as constitution.yaml lists it */
    readonly where: string;
  };
  readonly [WarningKind.FileUnreadable]: FileNamed & SourceNamed;
  readonly [WarningKind.RuleRepeated]: FileNamed &
    SourceNamed & {
      readonly rule: RuleSlug;
    };
  readonly [WarningKind.FrontMatterMissing]: FileNamed & SourceNamed;
  readonly [WarningKind.NotBlockFile]: FileNamed & SourceNamed;
  readonly [WarningKind.BlockRepeated]: FileNamed &
    SourceNamed & {
      readonly block: BlockId;
    };
  readonly [WarningKind.OutsideBlockFolder]: FileNamed & SourceNamed;
  readonly [WarningKind.FolderMisnamed]: FileNamed & SourceNamed;
  readonly [WarningKind.BaseNoBlock]: SourceNamed & {
    readonly base: string;
    readonly block: BlockId;
  };
  readonly [WarningKind.BaseConcrete]: SourceNamed & {
    readonly base: string;
    readonly block: BlockId;
  };
  readonly [WarningKind.RequiredNoBlock]: SourceNamed & {
    readonly block: BlockId;
    readonly required: string;
  };
  readonly [WarningKind.TightensUnknownRule]: SourceNamed & {
    readonly rule: RuleSlug;
    readonly tightens: RuleSlug;
  };
  readonly [WarningKind.BlockNeeded]: {
    readonly block: BlockId;
    /** for an abstract block, the blocks that extend it, one of which is listed in its place */
    readonly heirs?: readonly BlockId[];
    /** the key that lists the needed block */
    readonly key: string;
    readonly required: BlockId;
    readonly unit: UnitPath;
  };
  readonly [WarningKind.RequirementNotMet]: {
    readonly block: BlockId;
    readonly requirement: RuleSlug;
    readonly unit: UnitPath;
  };
  readonly [WarningKind.OverrideNamesNoRule]: OverrideNamed;
  readonly [WarningKind.OverrideExpired]: OverrideNamed & {
    /** the day it lapsed, written YYYY-MM-DD */
    readonly until: string;
  };
  readonly [WarningKind.ConfigurationFinding]: FileNamed & {
    /** the presets' code of the finding, such as `missing` */
    readonly code: string;
    /** what the finding says, as the presets word it */
    readonly says: string;
  };
  readonly [WarningKind.ConfigurationsUnchecked]: object;
  readonly [WarningKind.ReleaseLinkLoops]: {
    readonly unit: UnitPath;
  };
}

/**
 * What is wrong with a project, by its kind and the values it names; its code and the text a reader
 * sees follow from them.
 */
type ProjectWarning<TKind extends WarningKind = WarningKind> = {
  readonly [TEach in TKind]: {
    readonly details: WarningDetails[TEach];
    readonly kind: TEach;
  };
}[TKind];

// The kinds a block set's own files give, whose code is the set's.
type BlockSetKind =
  | WarningKind.FileUnreadable
  | WarningKind.RuleRepeated
  | WarningKind.FrontMatterMissing
  | WarningKind.NotBlockFile
  | WarningKind.BlockRepeated
  | WarningKind.OutsideBlockFolder
  | WarningKind.FolderMisnamed
  | WarningKind.BaseNoBlock
  | WarningKind.BaseConcrete
  | WarningKind.RequiredNoBlock
  | WarningKind.TightensUnknownRule;

const codeOfKind: {
  readonly [TKind in Exclude<WarningKind, BlockSetKind>]: WarningCode;
} = {
  [WarningKind.KeyMissing]: WarningCode.Config,
  [WarningKind.KeyUnknown]: WarningCode.Config,
  [WarningKind.KeyEmpty]: WarningCode.Config,
  [WarningKind.FoundationListed]: WarningCode.Config,
  [WarningKind.AxisUnknown]: WarningCode.Config,
  [WarningKind.MemberConfigUnparsed]: WarningCode.Config,
  [WarningKind.MemberConfigUnreadable]: WarningCode.Config,
  [WarningKind.NameIsPath]: WarningCode.Blocks,
  [WarningKind.NameUnknown]: WarningCode.Blocks,
  [WarningKind.CoreListed]: WarningCode.Blocks,
  [WarningKind.BlockUnderWrongKey]: WarningCode.Blocks,
  [WarningKind.AbstractListed]: WarningCode.Blocks,
  [WarningKind.PackUnlisted]: WarningCode.Blocks,
  [WarningKind.BlockNeeded]: WarningCode.Requirements,
  [WarningKind.RequirementNotMet]: WarningCode.Requirements,
  [WarningKind.OverrideIncomplete]: WarningCode.Overrides,
  [WarningKind.OverrideLevelNotLowered]: WarningCode.Overrides,
  [WarningKind.OverrideUntilMalformed]: WarningCode.Overrides,
  [WarningKind.OverrideNamesNoRule]: WarningCode.Overrides,
  [WarningKind.OverrideExpired]: WarningCode.Overrides,
  [WarningKind.MemberWithoutConfig]: WarningCode.Workspace,
  [WarningKind.PackNotInstalled]: WarningCode.Installation,
  [WarningKind.ReleaseLinkLoops]: WarningCode.Installation,
  [WarningKind.ConfigurationFinding]: WarningCode.Configurations,
  [WarningKind.ConfigurationsUnchecked]: WarningCode.Configurations,
};

const codeOfSource: {
  readonly [TKind in SourceKind]: WarningCode;
} = {
  [SourceKind.Release]: WarningCode.Constitution,
  [SourceKind.Pack]: WarningCode.Packs,
};

const isOfBlockSet = (warning: ProjectWarning): warning is ProjectWarning<BlockSetKind> =>
  !Object.hasOwn(codeOfKind, warning.kind);

/** The code of a warning, the subject a reader fixes and scripts against. */
const codeOf = (warning: ProjectWarning): WarningCode =>
  isOfBlockSet(warning) ? codeOfSource[warning.details.source] : codeOfKind[warning.kind];

const ProjectWarning = {
  codeOf,
} as const;

export type { WarningDetails };
export { ProjectWarning, WarningCode, WarningKind };
