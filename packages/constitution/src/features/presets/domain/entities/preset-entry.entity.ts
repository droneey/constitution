import { AXES, LAYER_RANK, Layer } from '#/kernel/constants';
import type { RoleTerm } from '#/kernel/entities';
import { BlockModel } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { BlockSource } from '#/kernel/value-objects';
import { SourceKind } from '#/kernel/value-objects';

import { EVERY } from '../constants';
import type { TargetFile } from '../value-objects';
import { PresetFilePath } from '../value-objects';
import type { PresetValue } from './preset-value.entity';

/** A preset file: one reader's entries on one axis, under the blocks its path names. */
interface PresetSet {
  /** the preset file's path as a reader opens it, from the folder checked or from the project */
  readonly file: string;
  readonly path: PresetFilePath;
  readonly source: BlockSource;
}

/** One setting of a preset file, keyed `<block> → <rule> | * → <language> | * → <file>`. */
interface PresetEntry {
  readonly block: string;
  readonly file: TargetFile;
  /** its place in its preset file, which orders the entries of one block */
  readonly index: number;
  readonly language: string;
  readonly rule: string;
  readonly set: PresetSet;
  readonly value: PresetValue;
}

const packOf = (source: BlockSource): string =>
  source.kind === SourceKind.Pack ? source.pack : '';

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
    compareText(PresetFilePath.textOf(left.set.path), PresetFilePath.textOf(right.set.path)) ||
    left.index - right.index;
};

const sourceOf = (entry: PresetEntry): string =>
  `${entry.set.file}: ${entry.block} → ${entry.rule}`;

const WITH = ' with ';
const SLUG_SEPARATOR = /-/g;

const groupOf = (entry: PresetEntry): string => {
  const { withs } = entry.set.path;

  if (withs.length > 0) {
    return withs.join(WITH);
  }

  return entry.rule === EVERY ? entry.block : entry.rule.replace(SLUG_SEPARATOR, ' ');
};

/**
 * The term an entry's `${role.<id>}` names: as its language spells it, or, for an entry of every
 * language, as the blocks its key and its preset file name do.
 */
const roleOf = (input: {
  entry: PresetEntry;
  id: string;
  model: BlockModel;
}): RoleTerm | undefined => {
  const { entry } = input;

  return BlockModel.roleOf(input.model, {
    id: input.id,
    readers:
      entry.language === EVERY
        ? [
            entry.block,
            entry.set.path.reader,
            ...entry.set.path.withs,
          ]
        : [
            entry.language,
          ],
  });
};

const PresetEntry = {
  groupOf,
  orderOf,
  roleOf,
  sourceOf,
} as const;

export type { PresetSet };
export { PresetEntry };
