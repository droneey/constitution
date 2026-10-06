import type { Finding } from '#/kernel';
import { LAYERS, Layer } from '#/kernel';

import type { Block, FrontMatter } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { requirableBy } from '../direction.utils';
import { aBlock } from '../wording.utils';

enum LayerField {
  Requires = 'requires',
  Extends = 'extends',
  Abstract = 'abstract',
  Languages = 'languages',
  Dictionary = 'dictionary',
}

const LAYER_FIELDS: readonly LayerField[] = [
  LayerField.Requires,
  LayerField.Extends,
  LayerField.Abstract,
  LayerField.Languages,
  LayerField.Dictionary,
];

const FILLED_ON: Readonly<Record<LayerField, readonly Layer[]>> = {
  [LayerField.Abstract]: [
    Layer.Implementation,
  ],
  [LayerField.Dictionary]: [
    Layer.Language,
    Layer.Implementation,
  ],
  [LayerField.Extends]: [
    Layer.Implementation,
  ],
  [LayerField.Languages]: [
    Layer.Implementation,
  ],
  [LayerField.Requires]: LAYERS.filter((layer) => requirableBy(layer).length > 0),
};

const isEmpty = (field: FrontMatter[LayerField]): boolean =>
  field === undefined || field === false || (Array.isArray(field) && field.length === 0);

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
    (field) => !(FILLED_ON[field].includes(block.layer) || isEmpty(block.frontMatter[field])),
  ).map((field) => ({
    message: `sets "${field}", which ${aBlock(block.layer)} leaves empty`,
    path: block.path,
  }));

// A tool's languages are those whose files its presets cover. A layer that
// leaves the field empty is reported by layerFindings alone.
const languageFindings = (input: { block: Block; byId: BlocksById }): readonly Finding[] =>
  FILLED_ON[LayerField.Languages].includes(input.block.layer)
    ? input.block.frontMatter.languages
        .filter((id) => input.byId.get(id)?.layer !== Layer.Language)
        .map((id) => ({
          message: `languages lists ${id}, which is not a language block`,
          path: input.block.path,
        }))
    : [];

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

const frontMatterCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...identityFindings(block),
    ...layerFindings(block),
    ...languageFindings({
      block,
      byId,
    }),
    ...flagFindings(block),
  ]);

export { frontMatterCheck };
