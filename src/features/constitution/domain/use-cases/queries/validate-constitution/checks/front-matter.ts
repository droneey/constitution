import type { Finding, Layer } from '#/kernel';
import { KIND_OF_LAYER, LAYERS } from '#/kernel';

import type { Block, FrontMatter } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { requirableBy } from '../direction.utils';
import { aBlock } from '../wording.utils';

type LayerField = 'requires' | 'extends' | 'abstract' | 'checks' | 'owns';

const LAYER_FIELDS: readonly LayerField[] = [
  'requires',
  'extends',
  'abstract',
  'checks',
  'owns',
];

const FILLED_ON: Readonly<Record<LayerField, readonly Layer[]>> = {
  abstract: [
    'implementation',
  ],
  checks: [
    'language',
    'implementation',
  ],
  extends: [
    'implementation',
  ],
  owns: [
    'language',
    'implementation',
  ],
  requires: LAYERS.filter((layer) => requirableBy(layer).length > 0),
};

const isEmpty = (value: FrontMatter[LayerField]): boolean =>
  value === undefined ||
  value === false ||
  (Array.isArray(value) && value.length === 0);

const identityFindings = (block: Block): readonly Finding[] => {
  const expectedKind = KIND_OF_LAYER[block.layer];

  return [
    ...(block.frontMatter.id === block.id
      ? []
      : [
          {
            message: `declares the id "${block.frontMatter.id}"; its folder names it "${block.id}"`,
            path: block.path,
          },
        ]),
    ...(block.frontMatter.kind === expectedKind
      ? []
      : [
          {
            message: `declares the kind "${block.frontMatter.kind}"; its folder makes it ${aBlock(block.layer)}, of the kind "${expectedKind}"`,
            path: block.path,
          },
        ]),
  ];
};

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

  return [
    ...(isAbstract === block.id.startsWith('_')
      ? []
      : [
          {
            message: isAbstract
              ? 'is abstract, so its id starts with "_"'
              : 'has an id starting with "_", so it is abstract',
            path: block.path,
          },
        ]),
    ...(block.frontMatter.status === 'stable'
      ? []
      : [
          {
            message: 'is draft; a block of the constitution is stable',
            path: block.path,
          },
        ]),
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
