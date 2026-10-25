import type { Layer } from '../constants';
import type { BlockId, PackPath, RuleSlug, UnitPath } from '../value-objects';
import type { WiringProblem } from './wiring-problem.entity';

// The codes of a project's warnings, in the order the digest gives them.
enum WarningCode {
  Missing = 'missing',
  Abstract = 'abstract',
  Unknown = 'unknown',
  WrongKey = 'wrong-key',
  Config = 'config',
  Pack = 'pack',
  Constitution = 'constitution',
  NotMet = 'not-met',
  Override = 'override',
  Unlisted = 'unlisted',
  Wiring = 'wiring',
  Loop = 'loop',
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
  FolderKeepsConfig = 'folder-keeps-config',
  ToolWiredNowhere = 'tool-wired-nowhere',
  FileMiswired = 'file-miswired',
  SkipOfNoMember = 'skip-of-no-member',
  MemberNotSkipped = 'member-not-skipped',
  WiringUnchecked = 'wiring-unchecked',
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
  readonly [WarningKind.FileUnreadable]: FileNamed;
  readonly [WarningKind.RuleRepeated]: FileNamed & {
    readonly rule: RuleSlug;
  };
  readonly [WarningKind.FrontMatterMissing]: FileNamed;
  readonly [WarningKind.NotBlockFile]: FileNamed;
  readonly [WarningKind.BlockRepeated]: FileNamed & {
    readonly block: BlockId;
  };
  readonly [WarningKind.OutsideBlockFolder]: FileNamed;
  readonly [WarningKind.FolderMisnamed]: FileNamed;
  readonly [WarningKind.BaseNoBlock]: {
    readonly base: string;
    readonly block: BlockId;
  };
  readonly [WarningKind.BaseConcrete]: {
    readonly base: string;
    readonly block: BlockId;
  };
  readonly [WarningKind.RequiredNoBlock]: {
    readonly block: BlockId;
    readonly required: string;
  };
  readonly [WarningKind.TightensUnknownRule]: {
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
  readonly [WarningKind.FolderKeepsConfig]: {
    readonly folder: string;
    /** the configuration file, from the folder */
    readonly path: string;
  };
  readonly [WarningKind.ToolWiredNowhere]: {
    readonly tool: string;
    readonly unit: UnitPath;
  };
  readonly [WarningKind.FileMiswired]: FileNamed & {
    readonly problems: readonly WiringProblem[];
  };
  readonly [WarningKind.SkipOfNoMember]: {
    readonly folder: string;
    /** the file that skips it */
    readonly path: string;
  };
  readonly [WarningKind.MemberNotSkipped]: {
    readonly member: string;
    /** the file that leaves it in */
    readonly path: string;
    readonly tool: string;
  };
  readonly [WarningKind.WiringUnchecked]: object;
  readonly [WarningKind.ReleaseLinkLoops]: {
    readonly unit: UnitPath;
  };
}

/**
 * What is wrong with a project, by its code — the group a reader scripts against — its kind and
 * the values it names; the text a reader sees is rendered from them at the edge.
 */
type ProjectWarning<TKind extends WarningKind = WarningKind> = {
  readonly [TEach in TKind]: {
    readonly code: WarningCode;
    readonly details: WarningDetails[TEach];
    readonly kind: TEach;
  };
}[TKind];

export type { ProjectWarning, WarningDetails };
export { WarningCode, WarningKind };
