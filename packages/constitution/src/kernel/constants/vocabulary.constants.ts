enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

// Each axis keeps a folder in a block and in a preset alike; foundation is always followed, and a
// project lists the others it follows.
const AXES = [
  Axis.Foundation,
  Axis.Architecture,
  Axis.Workflow,
] as const;
const OPTIONAL_AXES = [
  Axis.Architecture,
  Axis.Workflow,
] as const;

enum Kind {
  Core = 'core',
  Domain = 'domain',
  Context = 'context',
  Implementation = 'implementation',
}

enum Layer {
  Core = 'core',
  Domain = 'domain',
  Platform = 'platform',
  Language = 'language',
  Implementation = 'implementation',
}

const LAYERS = [
  Layer.Core,
  Layer.Domain,
  Layer.Platform,
  Layer.Language,
  Layer.Implementation,
] as const;

const LAYER_RANK = {
  [Layer.Core]: 0,
  [Layer.Domain]: 1,
  [Layer.Implementation]: 3,
  [Layer.Language]: 2,
  [Layer.Platform]: 2,
} as const satisfies Readonly<Record<Layer, number>>;

// The folder of each layer under the blocks folder; core's is its one block's.
const LAYER_FOLDER = {
  [Layer.Core]: 'core',
  [Layer.Domain]: 'domains',
  [Layer.Implementation]: 'implementations',
  [Layer.Language]: 'contexts/languages',
  [Layer.Platform]: 'contexts/platforms',
} as const satisfies Readonly<Record<Layer, string>>;

const LAYER_ARTICLE = {
  [Layer.Core]: 'a',
  [Layer.Domain]: 'a',
  [Layer.Implementation]: 'an',
  [Layer.Language]: 'a',
  [Layer.Platform]: 'a',
} as const satisfies Readonly<Record<Layer, string>>;

const KIND_OF_LAYER = {
  [Layer.Core]: Kind.Core,
  [Layer.Domain]: Kind.Domain,
  [Layer.Implementation]: Kind.Implementation,
  [Layer.Language]: Kind.Context,
  [Layer.Platform]: Kind.Context,
} as const satisfies Readonly<Record<Layer, Kind>>;

const BLOCKS_FOLDER = 'blocks';

enum Level {
  Must = 'MUST',
  Should = 'SHOULD',
  May = 'MAY',
}

const LEVELS = [
  Level.Must,
  Level.Should,
  Level.May,
] as const;
// An override lowers a rule, so it sets one of these, never MUST.
type LoweredLevel = Level.Should | Level.May;

const LOWERED_LEVELS: readonly LoweredLevel[] = [
  Level.Should,
  Level.May,
] as const;

// A rule states its Why and Tags in one table of this header and one row of as many cells.
const RULE_TABLE_HEADER = '| Why | Tags |';
const RULE_TABLE_CELLS = 2;

// A chapter or a seam opens with its title and a line that starts so; its first section, if it has
// one, is the general one, and its last, if it has one, the requirements for implementation.
const GOVERNS_LINE = '> Governs ';
const GENERAL_SECTION = 'General';
const REQUIREMENTS_SECTION = 'Requirements for implementation';

// An implementation answers the requirements of the blocks above it in its passport, under this
// heading, in a table of this header.
const REQUIREMENTS_HEADING = '## Requirements';
const REQUIREMENTS_TABLE_HEADER = '| Requirement | How | Met |';

// A lens names a concern a review reads every block for; a rule's Tags list its lenses.
enum Lens {
  Security = 'security',
  A11y = 'a11y',
  Performance = 'performance',
  Data = 'data',
  Ux = 'ux',
  Testing = 'testing',
  Errors = 'errors',
}

export type { LoweredLevel };
export {
  AXES,
  Axis,
  BLOCKS_FOLDER,
  GENERAL_SECTION,
  GOVERNS_LINE,
  KIND_OF_LAYER,
  Kind,
  LAYER_ARTICLE,
  LAYER_FOLDER,
  LAYER_RANK,
  LAYERS,
  Layer,
  LEVELS,
  Lens,
  Level,
  LOWERED_LEVELS,
  OPTIONAL_AXES,
  REQUIREMENTS_HEADING,
  REQUIREMENTS_SECTION,
  REQUIREMENTS_TABLE_HEADER,
  RULE_TABLE_CELLS,
  RULE_TABLE_HEADER,
};
