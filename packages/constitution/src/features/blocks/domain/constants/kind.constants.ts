import { Layer } from '#/kernel/constants';

enum Kind {
  Core = 'core',
  Domain = 'domain',
  Context = 'context',
  Implementation = 'implementation',
}

const KIND_OF_LAYER = {
  [Layer.Core]: Kind.Core,
  [Layer.Domain]: Kind.Domain,
  [Layer.Implementation]: Kind.Implementation,
  [Layer.Language]: Kind.Context,
  [Layer.Platform]: Kind.Context,
} as const satisfies Readonly<Record<Layer, Kind>>;

export { KIND_OF_LAYER };
