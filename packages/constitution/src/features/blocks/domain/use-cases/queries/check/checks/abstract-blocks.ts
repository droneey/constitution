import type { FindingOf } from '#/kernel/types';
import { containsId } from '#/kernel/utils';
import { BlockId } from '#/kernel/value-objects';

import { Block, BlockFile, BlockFileRole } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum AbstractBlocksCode {
  WithoutHeir = 'abstract-block-without-heir',
  NamesHeir = 'base-names-heir',
  SeamNamesHeir = 'base-seam-named-after-heir',
}

interface AbstractBlocksDetails {
  readonly [AbstractBlocksCode.WithoutHeir]: object;
  readonly [AbstractBlocksCode.NamesHeir]: {
    readonly heir: BlockId;
  };
  readonly [AbstractBlocksCode.SeamNamesHeir]: {
    readonly heir: BlockId;
  };
}

type AbstractBlocksFinding = FindingOf<AbstractBlocksDetails>;

const textOf = (input: { base: Block; file: BlockFile }): string =>
  input.file.role === BlockFileRole.Passport
    ? `${input.base.frontMatter.summary}\n${input.file.body}`
    : input.file.body;

const heirFindings = (input: { base: Block; heir: Block }): readonly AbstractBlocksFinding[] =>
  Block.filesOf(input.base).flatMap((file) => [
    ...(containsId({
      id: input.heir.id,
      text: textOf({
        base: input.base,
        file,
      }),
    })
      ? [
          {
            code: AbstractBlocksCode.NamesHeir,
            details: {
              heir: input.heir.id,
            },
            path: file.path,
          },
        ]
      : []),
    ...(BlockFile.isSeamWith(file, input.heir.id)
      ? [
          {
            code: AbstractBlocksCode.SeamNamesHeir,
            details: {
              heir: input.heir.id,
            },
            path: file.path,
          },
        ]
      : []),
  ]);

const baseFindings = (input: {
  base: Block;
  blocks: readonly Block[];
}): readonly AbstractBlocksFinding[] => {
  const heirs = input.blocks.filter(
    ({ frontMatter }) =>
      // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; an absent base equals none
      frontMatter.extends !== undefined && BlockId.equals(frontMatter.extends, input.base.id),
  );

  return heirs.length === 0
    ? [
        {
          code: AbstractBlocksCode.WithoutHeir,
          details: {},
          path: input.base.passport.path,
        },
      ]
    : heirs.flatMap((heir) =>
        heirFindings({
          base: input.base,
          heir,
        }),
      );
};

const abstractBlocksCheck: Check<AbstractBlocksFinding> = ({
  constitution,
}: CheckInput): readonly AbstractBlocksFinding[] =>
  constitution.blocks
    .filter((block) => block.frontMatter.abstract)
    .flatMap((base) =>
      baseFindings({
        base,
        blocks: constitution.blocks,
      }),
    );

export type { AbstractBlocksDetails };
export { AbstractBlocksCode, abstractBlocksCheck };
