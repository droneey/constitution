import { Axis, Layer } from '#/kernel/constants';

import type { Catalogue, CatalogueBlock, CatalogueRule } from '../../../entities';

// The catalogue as the resolution looks it up.
interface ProjectModel {
  readonly ancestors: ReadonlyMap<string, readonly string[]>;
  readonly blocks: readonly CatalogueBlock[];
  readonly byId: ReadonlyMap<string, CatalogueBlock>;
  readonly rules: ReadonlyMap<string, CatalogueRule>;
}

// A scope is the repository, 0, or one of its packages, from 1.
interface Scope {
  readonly app: string;
  readonly axes: Set<Axis>;
  readonly blocks: Set<string>;
  readonly index: number;
}

// The repository's scope, then its packages'.
type Scopes = readonly [
  Scope,
  ...Scope[],
];

const LAYER_KEYS: readonly (readonly [
  string,
  Layer,
])[] = [
  [
    'domains',
    Layer.Domain,
  ],
  [
    'platforms',
    Layer.Platform,
  ],
  [
    'languages',
    Layer.Language,
  ],
  [
    'implementations',
    Layer.Implementation,
  ],
];
const OPTIONAL_AXES: readonly Axis[] = [
  Axis.Architecture,
  Axis.Workflow,
];
const AXIS_ORDER: readonly Axis[] = [
  Axis.Foundation,
  ...OPTIONAL_AXES,
];

const LAYER_FOLDER: Readonly<Record<Layer, string>> = {
  // Stryker disable next-line StringLiteral: core is listed under no layer and never active, so no line or path names its folder
  [Layer.Core]: 'core',
  [Layer.Domain]: 'domains',
  [Layer.Implementation]: 'implementations',
  [Layer.Language]: 'contexts/languages',
  [Layer.Platform]: 'contexts/platforms',
};

const KEY_OF_LAYER: ReadonlyMap<Layer, string> = new Map(
  LAYER_KEYS.map(([key, layer]) => [
    layer,
    key,
  ]),
);
const LAYER_OF_KEY: ReadonlyMap<string, Layer> = new Map(LAYER_KEYS);

// Stryker disable next-line StringLiteral: core, the one layer no key lists, is always active, so no message names its key
const keyOfLayer = (layer: Layer): string => KEY_OF_LAYER.get(layer) ?? '';

const layerOfKey = (key: string): Layer | undefined => LAYER_OF_KEY.get(key);

// "a, b or c"
const joinWith = (input: { glue: string; words: readonly string[] }): string =>
  input.words
    .map((word, index) => {
      if (index === 0) {
        return word;
      }

      return `${index === input.words.length - 1 ? input.glue : ', '}${word}`;
    })
    .join('');

const modelOf = (
  catalogue: Catalogue & {
    ancestors: ReadonlyMap<string, readonly string[]>;
  },
): ProjectModel => ({
  ancestors: catalogue.ancestors,
  blocks: catalogue.blocks,
  byId: new Map(
    catalogue.blocks.map((block) => [
      block.id,
      block,
    ]),
  ),
  rules: new Map(
    catalogue.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  ),
});

// A block's bases, nearest first.
const basesOf = (input: { id: string; model: ProjectModel }): readonly string[] =>
  input.model.ancestors.get(input.id) ?? [];

// The rules that take their level from a rule, in the order they were read.
const kidsOf = (input: { model: ProjectModel; parent: string }): readonly string[] =>
  [
    ...input.model.rules.values(),
  ]
    .filter((rule) => rule.parent === input.parent && !rule.isLevelStated)
    .map((rule) => rule.slug);

const heirsOf = (input: { id: string; model: ProjectModel }): string => {
  const heirs = input.model.blocks
    .filter((block) => block.extends === input.id)
    .map((block) => block.id);

  return heirs.length === 0
    ? 'one of its heirs'
    : joinWith({
        glue: ' or ',
        words: heirs,
      });
};

const whereOf = (scope: Scope): string => (scope.index === 0 ? '' : ` in ${scope.app}`);

const isAxisOn = (input: { axis: string; scope: Scope }): boolean =>
  new Set<string>(input.scope.axes).has(input.axis);

const axisOf = (entry: string): string => entry.slice(0, entry.indexOf('/'));

const nameOf = (entry: string): string => entry.slice(entry.indexOf('/') + 1);

export type { ProjectModel, Scope, Scopes };
export {
  AXIS_ORDER,
  axisOf,
  basesOf,
  heirsOf,
  isAxisOn,
  keyOfLayer,
  kidsOf,
  LAYER_FOLDER,
  layerOfKey,
  modelOf,
  nameOf,
  OPTIONAL_AXES,
  whereOf,
};
