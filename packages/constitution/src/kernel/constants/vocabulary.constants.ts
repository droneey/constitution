import { PLUGINS_FOLDER_NAME } from './presets-folders.constants';

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

const AXIS_FOLDER_NAME = {
  [Axis.Architecture]: '@architecture',
  [Axis.Foundation]: '@foundation',
  [Axis.Workflow]: '@workflow',
} as const satisfies Readonly<Record<Axis, string>>;

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
const reservedWords: ReadonlySet<string> = new Set([
  SEAM_FOLDER_NAME,
  PLUGINS_FOLDER_NAME,
  ...AXES,
]);
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

const RULE_WHY_HEADING = '#### Why';
const RULE_EXAMPLES_HEADING = '#### Examples';

const VOCABULARY_SECTION = 'Vocabulary';

export type { LoweredLevel };
export {
  AXES,
  AXIS_FOLDER_NAME,
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
  RULE_EXAMPLES_HEADING,
  RULE_WHY_HEADING,
  reservedWords,
  SEAM_FOLDER_NAME,
  VOCABULARY_SECTION,
};
