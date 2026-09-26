import type { Finding } from '#/kernel';

import type { Block, BlockFile } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { containsId } from '../tokens.utils';

const textOf = (input: { base: Block; file: BlockFile }): string =>
  input.file.role === 'main'
    ? `${input.base.frontMatter.summary}\n${input.file.body}`
    : input.file.body;

const heirFindings = (input: {
  base: Block;
  heir: Block;
}): readonly Finding[] =>
  input.base.files.flatMap((file) => [
    ...(containsId({
      id: input.heir.id,
      text: textOf({
        base: input.base,
        file,
      }),
    })
      ? [
          {
            message: `names its heir ${input.heir.id}; a base knows nothing of its heirs`,
            path: file.path,
          },
        ]
      : []),
    ...(file.with === input.heir.id
      ? [
          {
            message: `is a with/ file named after the heir ${input.heir.id}; a base knows nothing of its heirs`,
            path: file.path,
          },
        ]
      : []),
  ]);

const baseFindings = (input: {
  base: Block;
  blocks: readonly Block[];
}): readonly Finding[] => {
  const heirs = input.blocks.filter(
    (block) => block.frontMatter.extends === input.base.id,
  );

  return heirs.length === 0
    ? [
        {
          message: 'is abstract and has no heir',
          path: input.base.path,
        },
      ]
    : heirs.flatMap((heir) =>
        heirFindings({
          base: input.base,
          heir,
        }),
      );
};

const abstractBlocksCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] =>
  constitution.blocks
    .filter((block) => block.frontMatter.abstract)
    .flatMap((base) =>
      baseFindings({
        base,
        blocks: constitution.blocks,
      }),
    );

export { abstractBlocksCheck };
