import type { Finding } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import { Block, BlockFile, BlockFileRole } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { containsId } from '../shared/tokens';

enum AbstractBlocksCode {
  WithoutHeir = 'abstract-block-without-heir',
  NamesHeir = 'base-names-heir',
  SeamNamesHeir = 'base-seam-named-after-heir',
}

const textOf = (input: { base: Block; file: BlockFile }): string =>
  input.file.role === BlockFileRole.Passport
    ? `${input.base.frontMatter.summary}\n${input.file.body}`
    : input.file.body;

const heirFindings = (input: { base: Block; heir: Block }): readonly Finding[] =>
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
            message: `names its heir ${input.heir.id}; a base knows nothing of its heirs`,
            path: file.path,
          },
        ]
      : []),
    ...(BlockFile.isSeamWith(file, input.heir.id)
      ? [
          {
            code: AbstractBlocksCode.SeamNamesHeir,
            message: `is a with/ file named after the heir ${input.heir.id}; a base knows nothing of its heirs`,
            path: file.path,
          },
        ]
      : []),
  ]);

const baseFindings = (input: { base: Block; blocks: readonly Block[] }): readonly Finding[] => {
  const heirs = input.blocks.filter(
    ({ frontMatter }) =>
      // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type; an absent base equals none
      frontMatter.extends !== undefined && BlockId.equals(frontMatter.extends, input.base.id),
  );

  return heirs.length === 0
    ? [
        {
          code: AbstractBlocksCode.WithoutHeir,
          message: 'is abstract and has no heir',
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

const abstractBlocksCheck: Check = ({ constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks
    .filter((block) => block.frontMatter.abstract)
    .flatMap((base) =>
      baseFindings({
        base,
        blocks: constitution.blocks,
      }),
    );

export { abstractBlocksCheck };
