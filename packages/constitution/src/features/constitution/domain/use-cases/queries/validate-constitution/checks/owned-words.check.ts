import type { Finding } from '#/kernel/types';

import type { Block, BlockFile } from '../../../../entities';
import { BlockFileRole } from '../../../../entities';
import { reachableFrom, withoutCodeFences } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { collapseWhitespace, ownedWordMatcher } from '../tokens.utils';

enum OwnedWordsCode {
  OwnedTwice = 'word-owned-twice',
  OutOfReach = 'owned-word-out-of-reach',
}

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
    for (const word of block.frontMatter.dictionary) {
      const owner = owners.get(word);

      if (owner === undefined) {
        owners.set(word, block.id);
      } else {
        duplicates.push({
          code: OwnedWordsCode.OwnedTwice,
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
const proseOf = (input: { block: Block; file: BlockFile }): string => {
  const body = withoutCodeFences(input.file.body);

  return collapseWhitespace(
    input.file.role === BlockFileRole.Passport
      ? `${input.block.frontMatter.summary}\n${body}`
      : body,
  );
};

const ownedWordsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
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
            code: OwnedWordsCode.OutOfReach,
            message: `names "${owner.word}", which ${owner.block} owns; only ${owner.block} and the blocks that depend on it may`,
            path: file.path,
          }));
      }),
    ),
  ];
};

export { ownedWordsCheck };
