enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

const AXES: readonly Axis[] = [
  Axis.Foundation,
  Axis.Architecture,
  Axis.Workflow,
];

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

const LAYERS: readonly Layer[] = [
  Layer.Core,
  Layer.Domain,
  Layer.Platform,
  Layer.Language,
  Layer.Implementation,
];

const LAYER_RANK: Readonly<Record<Layer, number>> = {
  [Layer.Core]: 0,
  [Layer.Domain]: 1,
  [Layer.Implementation]: 3,
  [Layer.Language]: 2,
  [Layer.Platform]: 2,
};

const KIND_OF_LAYER: Readonly<Record<Layer, Kind>> = {
  [Layer.Core]: Kind.Core,
  [Layer.Domain]: Kind.Domain,
  [Layer.Implementation]: Kind.Implementation,
  [Layer.Language]: Kind.Context,
  [Layer.Platform]: Kind.Context,
};

enum Level {
  Must = 'MUST',
  Should = 'SHOULD',
  May = 'MAY',
}

const LEVELS: readonly Level[] = [
  Level.Must,
  Level.Should,
  Level.May,
];

enum Tag {
  Security = 'security',
  A11y = 'a11y',
  Performance = 'performance',
  Data = 'data',
  Ux = 'ux',
  Testing = 'testing',
  Errors = 'errors',
}

export { AXES, Axis, KIND_OF_LAYER, Kind, LAYER_RANK, LAYERS, Layer, LEVELS, Level, Tag };
