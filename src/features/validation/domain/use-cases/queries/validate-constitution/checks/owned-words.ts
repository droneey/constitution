import type { Block, BlockFile, Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';
import { withoutCodeFences } from '#/libs/markdown';

import type { Check } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { byIdOf, closureOf } from '../closure.utils';
import { containsToken } from '../tokens.utils';
import { mainPathOf } from '../wording.utils';

interface Owners {
  duplicates: readonly Finding[];
  words: ReadonlyMap<string, string>;
}

const addWord = (input: {
  block: Block;
  owners: Owners;
  word: string;
}): Owners => {
  const owner = input.owners.words.get(input.word);

  if (owner === undefined) {
    return {
      duplicates: input.owners.duplicates,
      words: new Map(input.owners.words).set(input.word, input.block.id),
    };
  }

  return {
    duplicates: [
      ...input.owners.duplicates,
      {
        message: `owns "${input.word}", which ${owner} owns already`,
        path: mainPathOf(input.block),
      },
    ],
    words: input.owners.words,
  };
};

const ownersOf = (blocks: readonly Block[]): Owners =>
  blocks.reduce<Owners>(
    (owners, block) =>
      block.frontMatter.owns.reduce<Owners>(
        (current, word) =>
          addWord({
            block,
            owners: current,
            word,
          }),
        owners,
      ),
    {
      duplicates: [],
      words: new Map(),
    },
  );

const allowedOwners = (input: {
  block: Block;
  byId: BlocksById;
  file: BlockFile;
}): ReadonlySet<string> => {
  const seam = input.file.with;

  return new Set([
    input.block.id,
    ...closureOf({
      blockId: input.block.id,
      byId: input.byId,
    }),
    ...(seam === null
      ? []
      : [
          seam,
          ...closureOf({
            blockId: seam,
            byId: input.byId,
          }),
        ]),
  ]);
};

const fileFindings = (input: {
  allowed: ReadonlySet<string>;
  file: BlockFile;
  owners: Owners;
}): readonly Finding[] => {
  const text = withoutCodeFences(input.file.text);

  return [
    ...input.owners.words,
  ]
    .filter(
      ([word, owner]) =>
        !input.allowed.has(owner) &&
        containsToken({
          text,
          token: word,
        }),
    )
    .map(([word, owner]) => ({
      message: `names "${word}", which ${owner} owns; only ${owner} and the blocks that depend on it may`,
      path: input.file.path,
    }));
};

const ownedWordsCheck: Check = (
  constitution: Constitution,
): readonly Finding[] => {
  const byId = byIdOf(constitution.blocks);
  const owners = ownersOf(constitution.blocks);

  return [
    ...owners.duplicates,
    ...constitution.blocks.flatMap((block) =>
      block.files.flatMap((file) =>
        fileFindings({
          allowed: allowedOwners({
            block,
            byId,
            file,
          }),
          file,
          owners,
        }),
      ),
    ),
  ];
};

export { ownedWordsCheck };
