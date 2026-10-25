enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

// Each axis keeps a folder in a block and in a preset alike.
const AXES = [
  Axis.Foundation,
  Axis.Architecture,
  Axis.Workflow,
] as const;

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

const BLOCKS_FOLDER = 'blocks';
// The folder of an axis that holds its seams, <axis>/with/<block>.md.
const SEAM_FOLDER = 'with';
// The extension of every file of a block.
const MARKDOWN_EXTENSION = '.md';

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

// An implementation answers the requirements of the blocks above it in its passport, under this
// heading, in a table of this header.
const REQUIREMENTS_HEADING = '## Requirements';
const REQUIREMENTS_TABLE_HEADER = '| Requirement | How | Met |';

export type { LoweredLevel };
export {
  AXES,
  Axis,
  BLOCKS_FOLDER,
  LAYER_FOLDER,
  LAYER_RANK,
  LAYERS,
  Layer,
  LEVELS,
  Level,
  LOWERED_LEVELS,
  MARKDOWN_EXTENSION,
  REQUIREMENTS_HEADING,
  REQUIREMENTS_TABLE_HEADER,
  RULE_TABLE_CELLS,
  RULE_TABLE_HEADER,
  SEAM_FOLDER,
};
