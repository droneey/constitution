import type { Layer } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import type { PartFile, PassportFile } from './block-file.entity';
import { BlockFile } from './block-file.entity';
import type { FrontMatter } from './front-matter.entity';

enum BlockOrigin {
  Own = 'own',
  /** a block of the Constitution a pack extends, which only resolves the pack's references */
  Base = 'base',
}

interface Block {
  readonly frontMatter: FrontMatter;
  readonly id: BlockId;
  readonly layer: Layer;
  readonly origin: BlockOrigin;
  /** the chapters by axis, then the seams by axis */
  readonly parts: readonly PartFile[];
  readonly passport: PassportFile;
}

interface BlockPlace {
  readonly block: BlockId;
  readonly seam?: BlockId;
}

const linksOf = (block: Block): readonly BlockId[] => [
  ...block.frontMatter.requires,
  ...(block.frontMatter.extends === undefined
    ? []
    : [
        block.frontMatter.extends,
      ]),
];

const createBlock = (input: Block): Block => ({
  frontMatter: input.frontMatter,
  id: input.id,
  layer: input.layer,
  origin: input.origin,
  parts: input.parts,
  passport: input.passport,
});

const filesOf = (block: Block): readonly BlockFile[] => [
  block.passport,
  ...block.parts,
];

/** Names each file by the path a user opens: the folder the base was read from, then its path there. */
const asBase = (block: Block, folder: string): Block =>
  createBlock({
    ...block,
    origin: BlockOrigin.Base,
    parts: block.parts.map((file) => BlockFile.withPath(file, `${folder}/${file.path}`)),
    passport: BlockFile.withPath(block.passport, `${folder}/${block.passport.path}`),
  });

const placeOf = (block: Block, file: BlockFile): BlockPlace => {
  const seam = BlockFile.seamOf(file);

  return {
    block: block.id,
    ...(seam === undefined
      ? {}
      : {
          seam,
        }),
  };
};

const Block = {
  asBase,
  create: createBlock,
  filesOf,
  isBase: (block: Block): boolean => block.origin === BlockOrigin.Base,
  linksOf,
  placeOf,
  sameAs: (block: Block, other: Block): boolean => BlockId.equals(block.id, other.id),
} as const;

export type { BlockPlace };
export { Block, BlockOrigin };
