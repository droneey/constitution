import type { Layer } from '#/kernel/constants';
import { LAYERS, PATH_SEPARATOR } from '#/kernel/constants';
import { compareText } from '#/kernel/utils';
import { BlockId } from '#/kernel/value-objects';

import type { PartFile, PassportFile } from './block-file.entity';
import { BlockFile } from './block-file.entity';
import type { FrontMatter } from './front-matter.entity';

enum BlockOrigin {
  Own = 'own',
  Base = 'base',
}

interface Block {
  readonly frontMatter: FrontMatter;
  readonly id: BlockId;
  readonly layer: Layer;
  readonly origin: BlockOrigin;
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

const asBase = (block: Block, folder: string): Block =>
  createBlock({
    ...block,
    origin: BlockOrigin.Base,
    parts: block.parts.map((file) =>
      BlockFile.withPath(file, `${folder}${PATH_SEPARATOR}${file.path}`),
    ),
    passport: BlockFile.withPath(
      block.passport,
      `${folder}${PATH_SEPARATOR}${block.passport.path}`,
    ),
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

const compare = (block: Block, other: Block): number =>
  LAYERS.indexOf(block.layer) - LAYERS.indexOf(other.layer) || compareText(block.id, other.id);

const isBase = (block: Block): boolean => block.origin === BlockOrigin.Base;

const sameAs = (block: Block, other: Block): boolean => BlockId.equals(block.id, other.id);

const Block = {
  asBase,
  compare,
  create: createBlock,
  filesOf,
  isBase,
  linksOf,
  placeOf,
  sameAs,
} as const;

export type { BlockPlace };
export { Block, BlockOrigin };
