import { AXES, LAYER_RANK, Layer } from '#/kernel/constants';
import type { BlockModel } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { BlockSource } from '#/kernel/value-objects';
import { SourceKind } from '#/kernel/value-objects';

import type { TargetFile } from '../value-objects';
import { CataloguePath } from '../value-objects';
import type { PresetValue } from './preset-value.entity';

/** A catalogue: one reader's entries on one axis, under the blocks its path names. */
interface PresetSet {
  /** the catalogue's path as a reader opens it, from the folder checked or from the project */
  readonly file: string;
  readonly path: CataloguePath;
  readonly source: BlockSource;
}

/** One setting of a catalogue, keyed `<block> → <rule> | * → <language> | * → <file>`. */
interface PresetEntry {
  readonly block: string;
  readonly file: TargetFile;
  /** its place in its catalogue, which orders the entries of one block */
  readonly index: number;
  readonly language: string;
  readonly rule: string;
  readonly set: PresetSet;
  readonly value: PresetValue;
}

const packOf = (source: BlockSource): string =>
  source.kind === SourceKind.Pack ? source.pack : '';

/**
 * The order the entries of one file merge in: the layer of the key block, its id, the catalogue's
 * axis, the release before the packs, the catalogue's path, then the entry's place in it.
 */
const orderOf = (model: BlockModel): ((left: PresetEntry, right: PresetEntry) => number) => {
  const layers = new Map<string, Layer>(
    model.blocks.map((block) => [
      block.id,
      block.layer,
    ]),
  );

  // a block the model does not know sorts with the implementations, the most specific layer
  const rankOf = (entry: PresetEntry): number =>
    LAYER_RANK[layers.get(entry.block) ?? Layer.Implementation];

  return (left: PresetEntry, right: PresetEntry): number =>
    rankOf(left) - rankOf(right) ||
    compareText(left.block, right.block) ||
    AXES.indexOf(left.set.path.axis) - AXES.indexOf(right.set.path.axis) ||
    compareText(packOf(left.set.source), packOf(right.set.source)) ||
    compareText(CataloguePath.textOf(left.set.path), CataloguePath.textOf(right.set.path)) ||
    left.index - right.index;
};

const sourceOf = (entry: PresetEntry): string =>
  `${entry.set.file}: ${entry.block} → ${entry.rule}`;

const PresetEntry = {
  orderOf,
  sourceOf,
} as const;

export type { PresetSet };
export { PresetEntry };
