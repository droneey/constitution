import type { Finding } from '#/kernel';
import { LAYERS, Layer } from '#/kernel';

import type { Block, FrontMatter } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { requirableBy } from '../direction.utils';
import { aBlock } from '../wording.utils';

enum LayerField {
  Requires = 'requires',
  Extends = 'extends',
  Abstract = 'abstract',
  Checks = 'checks',
  Dictionary = 'dictionary',
}

const LAYER_FIELDS: readonly LayerField[] = [
  LayerField.Requires,
  LayerField.Extends,
  LayerField.Abstract,
  LayerField.Checks,
  LayerField.Dictionary,
];

const FILLED_ON: Readonly<Record<LayerField, readonly Layer[]>> = {
  [LayerField.Abstract]: [
    Layer.Implementation,
  ],
  [LayerField.Checks]: [
    Layer.Language,
    Layer.Implementation,
  ],
  [LayerField.Dictionary]: [
    Layer.Language,
    Layer.Implementation,
  ],
  [LayerField.Extends]: [
    Layer.Implementation,
  ],
  [LayerField.Requires]: LAYERS.filter(
    (layer) => requirableBy(layer).length > 0,
  ),
};

const isEmpty = (value: FrontMatter[LayerField]): boolean =>
  value === undefined ||
  value === false ||
  (Array.isArray(value) && value.length === 0);

const identityFindings = (block: Block): readonly Finding[] =>
  block.frontMatter.id === block.id
    ? []
    : [
        {
          message: `declares the id "${block.frontMatter.id}"; its folder names it "${block.id}"`,
          path: block.path,
        },
      ];

const layerFindings = (block: Block): readonly Finding[] =>
  LAYER_FIELDS.filter(
    (field) =>
      !(
        FILLED_ON[field].includes(block.layer) ||
        isEmpty(block.frontMatter[field])
      ),
  ).map((field) => ({
    message: `sets "${field}", which ${aBlock(block.layer)} leaves empty`,
    path: block.path,
  }));

const flagFindings = (block: Block): readonly Finding[] => {
  const isAbstract = block.frontMatter.abstract;

  return isAbstract === block.id.startsWith('_')
    ? []
    : [
        {
          message: isAbstract
            ? 'is abstract, so its id starts with "_"'
            : 'has an id starting with "_", so it is abstract',
          path: block.path,
        },
      ];
};

const frontMatterCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...identityFindings(block),
    ...layerFindings(block),
    ...flagFindings(block),
  ]);

export { frontMatterCheck };
