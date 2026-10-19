import { Layer } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';

import type { Block, BlockFile } from '../../../../entities';
import { BlockFileRole } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { stemOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { pairableBy } from '../direction.utils';
import { aBlock, blocksOf } from '../wording.utils';

enum SeamsCode {
  NamedAfterOwnBlock = 'seam-named-after-own-block',
  BlockPairsWithNone = 'seam-of-unpairing-block',
  NotPair = 'seam-names-no-pair',
  OutOfLayer = 'seam-out-of-layer',
  TitleMismatch = 'seam-title-mismatch',
  ChapterNamedAfterBlock = 'chapter-named-after-block',
}

interface Subject {
  block: Block;
  byId: BlocksById;
}

const MARKDOWN_EXTENSION = '.md';

const TITLE = '# ';

/** a file's title line, its first first-level heading */
const titleOf = (body: string): string | undefined =>
  body.split('\n').find((line) => line.startsWith(TITLE));

const pairingProblem = (
  input: Subject & {
    other: string;
  },
): Problem | undefined => {
  const target = input.byId.get(input.other);
  const allowed = pairableBy(input.block.layer);

  if (input.other === input.block.id) {
    return {
      code: SeamsCode.NamedAfterOwnBlock,
      message: 'is named after its own block',
    };
  }

  if (allowed.length === 0) {
    return {
      code: SeamsCode.BlockPairsWithNone,
      message: `is a with/ file of ${input.block.id}, which pairs with no block`,
    };
  }

  if (target === undefined || target.layer === Layer.Core) {
    return {
      code: SeamsCode.NotPair,
      message: `is named after ${input.other}, which is not a block it may pair with`,
    };
  }

  return allowed.includes(target.layer)
    ? undefined
    : {
        code: SeamsCode.OutOfLayer,
        message: `is named after ${input.other}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} pairs only with ${blocksOf(allowed)}`,
      };
};

/** a seam titled otherwise than the other block's passport, since the seam's folder already names the block it belongs to */
const titleProblem = (input: {
  file: BlockFile;
  other: Block | undefined;
}): Problem | undefined => {
  // Stryker disable next-line OptionalChaining,ConditionalExpression: a sound pair's other block is loaded, and its first file is its passport
  const passport = input.other?.files.find((file) => file.role === BlockFileRole.Passport);
  // Stryker disable next-line OptionalChaining,StringLiteral: every loaded block has its passport
  const expected = titleOf(passport?.body ?? '');

  return titleOf(input.file.body) === expected
    ? undefined
    : {
        code: SeamsCode.TitleMismatch,
        message: "is titled otherwise than the other block's passport, whose title a seam takes",
      };
};

const seamFindings = (subject: Subject): readonly Finding[] =>
  subject.block.files.flatMap((file) => {
    if (file.with === undefined) {
      return [];
    }

    const problem =
      pairingProblem({
        ...subject,
        other: file.with,
      }) ??
      titleProblem({
        file,
        other: subject.byId.get(file.with),
      });

    return problem === undefined
      ? []
      : [
          {
            ...problem,
            path: file.path,
          },
        ];
  });

const chapterFindings = (subject: Subject): readonly Finding[] =>
  subject.block.files
    .filter((file) => file.role === BlockFileRole.Chapter)
    .flatMap((file) => {
      const name = stemOf({
        extension: MARKDOWN_EXTENSION,
        path: file.path,
      });

      return subject.byId.has(name)
        ? [
            {
              code: SeamsCode.ChapterNamedAfterBlock,
              message: `takes the id of the block ${name}; a file named after a block belongs in with/`,
              path: file.path,
            },
          ]
        : [];
    });

const seamsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...seamFindings({
      block,
      byId,
    }),
    ...chapterFindings({
      block,
      byId,
    }),
  ]);

export { seamsCheck };
