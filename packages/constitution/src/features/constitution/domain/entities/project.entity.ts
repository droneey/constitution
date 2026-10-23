import type { Axis, Layer, Level } from '#/kernel/constants';

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
}

interface ProjectWarning {
  readonly code: WarningCode;
  readonly message: string;
}

// A block of the Constitution or of a pack as a project reads it; a card without front matter
// leaves its fields empty.
interface CatalogueBlock {
  // <axis>/<name>.md, in the order the blocks are read
  readonly chapters: readonly string[];
  readonly extends?: string;
  readonly governs: readonly string[];
  readonly id: string;
  readonly isAbstract: boolean;
  readonly layer: Layer;
  readonly requires: readonly string[];
  // <axis>/<block> of each with/ file
  readonly seams: readonly string[];
  // '' for the Constitution, else the pack's path as constitution.yaml names it
  readonly source: string;
  readonly summary: string;
}

interface CatalogueRule {
  readonly axis: Axis;
  readonly block: string;
  // false when it takes its level from its parent
  readonly isLevelStated: boolean;
  readonly level: Level;
  readonly parent?: string;
  readonly slug: string;
  readonly with?: string;
}

interface CatalogueAnswer {
  readonly block: string;
  readonly met: string;
  readonly requirement: string;
}

interface Catalogue {
  readonly answers: readonly CatalogueAnswer[];
  readonly blocks: readonly CatalogueBlock[];
  readonly rules: readonly CatalogueRule[];
}

// Scope 0 is the repository; scope s > 0 is its package s, which holds scope 0's blocks and its own.
interface ProjectUnit {
  readonly axes: readonly Axis[];
  readonly blocks: ReadonlySet<string>;
  // the rules its own overrides lower
  readonly lowered: ReadonlySet<string>;
  // '' for the repository
  readonly path: string;
  readonly scope: number;
}

interface ActiveBlock {
  readonly app: string;
  readonly files: readonly string[];
  readonly globs: readonly string[];
  readonly id: string;
  readonly scope: number;
}

interface MustRule {
  readonly block: string;
  // the slug, with the note of the overrides that lower it
  readonly rule: string;
}

interface Resolution {
  readonly active: readonly ActiveBlock[];
  readonly blocks: readonly {
    readonly id: string;
    readonly layer: Layer;
  }[];
  // '' when the project names none
  readonly check: string;
  readonly count: number;
  readonly index: readonly string[];
  readonly musts: readonly MustRule[];
  readonly units: readonly ProjectUnit[];
  readonly warnings: readonly ProjectWarning[];
}

// Why a project's Constitution cannot be read, each failure naming the path it stopped at.
enum ProjectFailure {
  NoProject = 'no-project',
  ArchiveMissing = 'archive-missing',
  ManifestUnreadable = 'manifest-unreadable',
  VersionMissing = 'version-missing',
  ConfigUnreadable = 'config-unreadable',
  ConfigUnparsed = 'config-unparsed',
  BlocksUnlisted = 'blocks-unlisted',
  CoreUnreadable = 'core-unreadable',
}

// Why a session gets only a notice: no release installed, or one of a block format this program
// does not read.
enum ReleaseNotice {
  Missing = 'missing',
  Older = 'older',
  Newer = 'newer',
}

// The fingerprints of the tree a session records: when the user last prompted, when the check
// last passed, when the gate last blocked and when the reviewer last reviewed.
enum SessionMark {
  Turn = 'turn',
  Checked = 'checked',
  Blocked = 'blocked',
  Reviewed = 'reviewed',
}

// What a session keeps for the hooks that follow its start.
interface SessionState {
  readonly active: readonly ActiveBlock[];
  // absent when constitution.yaml does not parse, '' when it names no check
  readonly check?: string;
  readonly musts: readonly MustRule[];
  readonly project: string;
}

export type {
  ActiveBlock,
  Catalogue,
  CatalogueAnswer,
  CatalogueBlock,
  CatalogueRule,
  MustRule,
  ProjectUnit,
  ProjectWarning,
  Resolution,
  SessionState,
};
export { ProjectFailure, ReleaseNotice, SessionMark, WarningCode };
