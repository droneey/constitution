import type { Finding } from '#/kernel';
import { withoutCodeFences } from '#/libs/markdown';

import type { Block, BlockFile } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { reachableFrom } from '../closure.utils';
import { collapseWhitespace, ownedWordMatcher } from '../tokens.utils';

interface Owner {
  block: string;
  matches: (text: string) => boolean;
  word: string;
}

interface Owners {
  duplicates: readonly Finding[];
  owners: readonly Owner[];
}

const ownersOf = (blocks: readonly Block[]): Owners => {
  const owners = new Map<string, string>();
  const duplicates: Finding[] = [];

  for (const block of blocks) {
    for (const word of block.frontMatter.owns) {
      const owner = owners.get(word);

      if (owner === undefined) {
        owners.set(word, block.id);
      } else {
        duplicates.push({
          message: `owns "${word}", which ${owner} owns already`,
          path: block.path,
        });
      }
    }
  }

  return {
    duplicates,
    owners: [
      ...owners,
    ].map(([word, block]) => ({
      block,
      matches: ownedWordMatcher(word),
      word,
    })),
  };
};

// The summary is prose too: it is the block's line in every digest.
const proseOf = (input: { block: Block; file: BlockFile }): string =>
  collapseWhitespace(
    [
      ...(input.file.role === 'main'
        ? [
            input.block.frontMatter.summary,
          ]
        : []),
      withoutCodeFences(input.file.body),
    ].join('\n'),
  );

const ownedWordsCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const { duplicates, owners } = ownersOf(constitution.blocks);

  return [
    ...duplicates,
    ...constitution.blocks.flatMap((block) =>
      block.files.flatMap((file) => {
        const allowed = reachableFrom({
          byId,
          place: {
            block: block.id,
            with: file.with,
          },
        });
        const text = proseOf({
          block,
          file,
        });

        return owners
          .filter((owner) => !allowed.has(owner.block) && owner.matches(text))
          .map((owner) => ({
            message: `names "${owner.word}", which ${owner.block} owns; only ${owner.block} and the blocks that depend on it may`,
            path: file.path,
          }));
      }),
    ),
  ];
};

export { ownedWordsCheck };
