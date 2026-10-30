import type { ConfigKey, Layer, RequiredConfigKey } from '../constants';
import type { BlockId, PackPath, RuleSlug, UnitPath } from '../value-objects';
import { SourceKind } from '../value-objects';

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
  NoRepository = 'no-repository',
}

interface FileNamed {
  readonly file: string;
}

interface KeyNamed extends FileNamed {
  readonly key: RequiredConfigKey;
}

interface NameGiven {
  readonly name: string;
}

interface OverrideNamed {
  readonly rule: string;
}

interface SourceNamed {
  readonly source: SourceKind;
}

interface WarningDetails {
  readonly [WarningKind.MemberWithoutConfig]: {
    readonly member: UnitPath;
  };
  readonly [WarningKind.MemberConfigUnparsed]: {
    readonly lines: readonly number[];
    readonly member: UnitPath;
  };
  readonly [WarningKind.MemberConfigUnreadable]: {
    readonly member: UnitPath;
  };
  readonly [WarningKind.KeyMissing]: KeyNamed;
  readonly [WarningKind.KeyUnknown]: FileNamed & {
    readonly key: string;
  };
  readonly [WarningKind.KeyEmpty]: KeyNamed;
  readonly [WarningKind.FoundationListed]: FileNamed;
  readonly [WarningKind.AxisUnknown]: {
    readonly axis: string;
  };
  readonly [WarningKind.OverrideIncomplete]: {
    readonly line: number;
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
    readonly key: ConfigKey;
  };
  readonly [WarningKind.BlockUnderWrongKey]: NameGiven & {
    readonly key: ConfigKey;
    readonly layer: Layer;
    readonly toKey: ConfigKey;
  };
  readonly [WarningKind.AbstractListed]: NameGiven & {
    readonly heirs: readonly BlockId[];
  };
  readonly [WarningKind.PackUnlisted]: FileNamed &
    NameGiven & {
      readonly pack: PackPath;
    };
  readonly [WarningKind.PackNotInstalled]: {
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
    readonly heirs?: readonly BlockId[];
    readonly key: ConfigKey;
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
    readonly until: string;
  };
  readonly [WarningKind.ConfigurationFinding]: FileNamed & {
    readonly code: string;
    readonly says: string;
  };
  readonly [WarningKind.ConfigurationsUnchecked]: {
    readonly reason?: string;
  };
  readonly [WarningKind.ReleaseLinkLoops]: {
    readonly unit: UnitPath;
  };
  readonly [WarningKind.NoRepository]: object;
}

type ProjectWarning<TKind extends WarningKind = WarningKind> = {
  readonly [TEach in TKind]: {
    readonly details: WarningDetails[TEach];
    readonly kind: TEach;
  };
}[TKind];

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
  [WarningKind.NoRepository]: WarningCode.Installation,
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

const codeOf = (warning: ProjectWarning): WarningCode =>
  isOfBlockSet(warning) ? codeOfSource[warning.details.source] : codeOfKind[warning.kind];

const ProjectWarning = {
  codeOf,
} as const;

export type { WarningDetails };
export { ProjectWarning, WarningCode, WarningKind };
