import { LAYERS, Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { Block, BlockGraph, FrontMatter } from '../../../../entities';
import { FrontMatterField, requirableBy } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum FrontMatterCode {
  IdMismatch = 'id-mismatches-folder',
  FieldOutsideLayer = 'field-outside-layer',
  NotLanguage = 'languages-names-no-language',
  AbstractWithoutUnderscore = 'abstract-id-without-underscore',
  UnderscoreNotAbstract = 'underscore-id-not-abstract',
}

// The fields of the front matter that only some layers fill.
const LAYER_FIELDS = [
  FrontMatterField.Requires,
  FrontMatterField.Extends,
  FrontMatterField.Abstract,
  FrontMatterField.Languages,
] as const;

type LayerField = (typeof LAYER_FIELDS)[number];

interface FrontMatterDetails {
  readonly [FrontMatterCode.IdMismatch]: {
    readonly declared: BlockId;
    readonly folder: BlockId;
  };
  readonly [FrontMatterCode.FieldOutsideLayer]: {
    readonly field: LayerField;
    readonly layer: Layer;
  };
  readonly [FrontMatterCode.NotLanguage]: {
    readonly listed: BlockId;
  };
  readonly [FrontMatterCode.AbstractWithoutUnderscore]: object;
  readonly [FrontMatterCode.UnderscoreNotAbstract]: object;
}

type FrontMatterFinding = FindingOf<FrontMatterDetails>;

const builtOn: readonly Layer[] = LAYERS.filter((layer) => layer !== Layer.Core);

const filledOn: Readonly<Record<LayerField, readonly Layer[]>> = {
  [FrontMatterField.Abstract]: builtOn,
  [FrontMatterField.Extends]: builtOn,
  [FrontMatterField.Languages]: [
    Layer.Implementation,
  ],
  [FrontMatterField.Requires]: LAYERS.filter((layer) => requirableBy(layer).length > 0),
};

const isEmpty = (field: FrontMatter[LayerField]): boolean =>
  field === undefined || field === false || (Array.isArray(field) && field.length === 0);

const identityFindings = (block: Block): readonly FrontMatterFinding[] =>
  BlockId.equals(block.frontMatter.id, block.id)
    ? []
    : [
        {
          code: FrontMatterCode.IdMismatch,
          details: {
            declared: block.frontMatter.id,
            folder: block.id,
          },
          path: block.passport.path,
        },
      ];

const layerFindings = (block: Block): readonly FrontMatterFinding[] =>
  LAYER_FIELDS.filter(
    (field) => !(filledOn[field].includes(block.layer) || isEmpty(block.frontMatter[field])),
  ).map((field) => ({
    code: FrontMatterCode.FieldOutsideLayer,
    details: {
      field,
      layer: block.layer,
    },
    path: block.passport.path,
  }));

// A tool's languages are those whose files its presets cover. A layer that
// leaves the field empty is reported by layerFindings alone.
const languageFindings = (input: {
  block: Block;
  graph: BlockGraph;
}): readonly FrontMatterFinding[] =>
  filledOn[FrontMatterField.Languages].includes(input.block.layer)
    ? input.block.frontMatter.languages
        .filter((id) => input.graph.get(id)?.layer !== Layer.Language)
        .map((listed) => ({
          code: FrontMatterCode.NotLanguage,
          details: {
            listed,
          },
          path: input.block.passport.path,
        }))
    : [];

const flagFindings = (block: Block): readonly FrontMatterFinding[] => {
  const isAbstract = block.frontMatter.abstract;

  return isAbstract === BlockId.isAbstract(block.id)
    ? []
    : [
        {
          code: isAbstract
            ? FrontMatterCode.AbstractWithoutUnderscore
            : FrontMatterCode.UnderscoreNotAbstract,
          details: {},
          path: block.passport.path,
        },
      ];
};

const frontMatterCheck: Check<FrontMatterFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly FrontMatterFinding[] =>
  constitution.blocks.flatMap((block) => [
    ...identityFindings(block),
    ...layerFindings(block),
    ...languageFindings({
      block,
      graph,
    }),
    ...flagFindings(block),
  ]);

export type { FrontMatterDetails };
export { FrontMatterCode, frontMatterCheck };
