import { LAYERS, Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { Block, BlockGraph, FrontMatter } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { requirableBy } from '../shared/layers';
import { aBlock } from '../shared/wording';

enum FrontMatterCode {
  IdMismatch = 'id-mismatches-folder',
  FieldOutsideLayer = 'field-outside-layer',
  NotLanguage = 'languages-names-no-language',
  AbstractWithoutUnderscore = 'abstract-id-without-underscore',
  UnderscoreNotAbstract = 'underscore-id-not-abstract',
}

enum LayerField {
  Requires = 'requires',
  Extends = 'extends',
  Abstract = 'abstract',
  Languages = 'languages',
}

const LAYER_FIELDS: readonly LayerField[] = [
  LayerField.Requires,
  LayerField.Extends,
  LayerField.Abstract,
  LayerField.Languages,
] as const;

const builtOn: readonly Layer[] = LAYERS.filter((layer) => layer !== Layer.Core);

const filledOn: Readonly<Record<LayerField, readonly Layer[]>> = {
  [LayerField.Abstract]: builtOn,
  [LayerField.Extends]: builtOn,
  [LayerField.Languages]: [
    Layer.Implementation,
  ],
  [LayerField.Requires]: LAYERS.filter((layer) => requirableBy(layer).length > 0),
};

const isEmpty = (field: FrontMatter[LayerField]): boolean =>
  field === undefined || field === false || (Array.isArray(field) && field.length === 0);

const identityFindings = (block: Block): readonly Finding[] =>
  BlockId.equals(block.frontMatter.id, block.id)
    ? []
    : [
        {
          code: FrontMatterCode.IdMismatch,
          message: `declares the id "${block.frontMatter.id}"; its folder names it "${block.id}"`,
          path: block.passport.path,
        },
      ];

const layerFindings = (block: Block): readonly Finding[] =>
  LAYER_FIELDS.filter(
    (field) => !(filledOn[field].includes(block.layer) || isEmpty(block.frontMatter[field])),
  ).map((field) => ({
    code: FrontMatterCode.FieldOutsideLayer,
    message: `sets "${field}", which ${aBlock(block.layer)} leaves empty`,
    path: block.passport.path,
  }));

// A tool's languages are those whose files its presets cover. A layer that
// leaves the field empty is reported by layerFindings alone.
const languageFindings = (input: { block: Block; graph: BlockGraph }): readonly Finding[] =>
  filledOn[LayerField.Languages].includes(input.block.layer)
    ? input.block.frontMatter.languages
        .filter((id) => input.graph.get(id)?.layer !== Layer.Language)
        .map((id) => ({
          code: FrontMatterCode.NotLanguage,
          message: `languages lists ${id}, which is not a language block`,
          path: input.block.passport.path,
        }))
    : [];

const flagFindings = (block: Block): readonly Finding[] => {
  const isAbstract = block.frontMatter.abstract;

  return isAbstract === BlockId.isAbstract(block.id)
    ? []
    : [
        isAbstract
          ? {
              code: FrontMatterCode.AbstractWithoutUnderscore,
              message: 'is abstract, so its id starts with "_"',
              path: block.passport.path,
            }
          : {
              code: FrontMatterCode.UnderscoreNotAbstract,
              message: 'has an id starting with "_", so it is abstract',
              path: block.passport.path,
            },
      ];
};

const frontMatterCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...identityFindings(block),
    ...layerFindings(block),
    ...languageFindings({
      block,
      graph,
    }),
    ...flagFindings(block),
  ]);

export { frontMatterCheck };
