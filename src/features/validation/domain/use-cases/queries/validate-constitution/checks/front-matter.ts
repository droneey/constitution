import type { Block, Constitution, FrontMatter } from '#/features/constitution';
import type { Finding, Layer } from '#/kernel';
import { KIND_OF_LAYER } from '#/kernel';

import type { Check } from '../check.types';
import { aBlock, mainPathOf } from '../wording.utils';

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
  requires: [
    'platform',
    'language',
    'implementation',
  ],
};

const isEmpty = (value: FrontMatter[LayerField]): boolean =>
  value === null ||
  value === false ||
  (Array.isArray(value) && value.length === 0);

const identityFindings = (block: Block): readonly Finding[] => {
  const path = mainPathOf(block);
  const expectedKind = KIND_OF_LAYER[block.layer];

  return [
    ...(block.frontMatter.id === block.id
      ? []
      : [
          {
            message: `declares the id "${block.frontMatter.id}"; its folder names it "${block.id}"`,
            path,
          },
        ]),
    ...(block.frontMatter.kind === expectedKind
      ? []
      : [
          {
            message: `declares the kind "${block.frontMatter.kind}"; its folder makes it ${aBlock(block.layer)}`,
            path,
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
    path: mainPathOf(block),
  }));

const flagFindings = (block: Block): readonly Finding[] => {
  const path = mainPathOf(block);
  const isAbstract = block.frontMatter.abstract;

  return [
    ...(isAbstract === block.id.startsWith('_')
      ? []
      : [
          {
            message: isAbstract
              ? 'is abstract, so its id starts with "_"'
              : 'has an id starting with "_", so it is abstract',
            path,
          },
        ]),
    ...(block.frontMatter.status === 'stable'
      ? []
      : [
          {
            message: 'is draft; a block of the constitution is stable',
            path,
          },
        ]),
  ];
};

const frontMatterCheck: Check = (
  constitution: Constitution,
): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...identityFindings(block),
    ...layerFindings(block),
    ...flagFindings(block),
  ]);

export { frontMatterCheck };
