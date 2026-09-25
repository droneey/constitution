import type { Block, Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';

import type { Check } from '../check.types';
import { containsToken } from '../tokens.utils';
import { mainPathOf } from '../wording.utils';

const findingsOf = (input: {
  base: Block;
  blocks: readonly Block[];
}): readonly Finding[] => {
  const heirs = input.blocks.filter(
    (block) => block.frontMatter.extends === input.base.id,
  );

  if (heirs.length === 0) {
    return [
      {
        message: 'is abstract and has no heir',
        path: mainPathOf(input.base),
      },
    ];
  }

  return heirs.flatMap((heir) =>
    input.base.files
      .filter((file) =>
        containsToken({
          text: file.text,
          token: heir.id,
        }),
      )
      .map((file) => ({
        message: `names its heir ${heir.id}; a base knows nothing of its heirs`,
        path: file.path,
      })),
  );
};

const abstractBlocksCheck: Check = (
  constitution: Constitution,
): readonly Finding[] =>
  constitution.blocks
    .filter((block) => block.frontMatter.abstract)
    .flatMap((base) =>
      findingsOf({
        base,
        blocks: constitution.blocks,
      }),
    );

export { abstractBlocksCheck };
