enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

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

const LAYER_FOLDER_NAME = {
  [Layer.Core]: 'core',
  [Layer.Domain]: 'domains',
  [Layer.Implementation]: 'implementations',
  [Layer.Language]: 'contexts/languages',
  [Layer.Platform]: 'contexts/platforms',
} as const satisfies Readonly<Record<Layer, string>>;

const BLOCKS_FOLDER_NAME = 'blocks';
const SEAM_FOLDER_NAME = 'with';
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
const LOWERED_LEVELS = [
  Level.Should,
  Level.May,
] as const;

type LoweredLevel = (typeof LOWERED_LEVELS)[number];

const RULE_TABLE_HEADER = '| Why |';
const RULE_TABLE_CELLS = 1;

const REQUIREMENTS_HEADING = '## Requirements';
const REQUIREMENTS_TABLE_HEADER = '| Requirement | How | Met |';

export type { LoweredLevel };
export {
  AXES,
  Axis,
  BLOCKS_FOLDER_NAME,
  LAYER_FOLDER_NAME,
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
  SEAM_FOLDER_NAME,
};
