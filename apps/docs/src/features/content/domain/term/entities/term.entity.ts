import { Axis, axisOfFolder, BlockLayer } from '../../block/entities';
import { PATH_SEPARATOR } from '../../shared/constants';
import { InvalidValueError, ValueFailure } from '../../shared/errors';
import type { BlockPath } from '../../shared/value-objects';

enum TermKind {
  Concept = 'concept',
  Brand = 'brand',
  Folder = 'folder',
  Suffix = 'suffix',
  File = 'file',
  Api = 'api',
}

interface Term {
  readonly address: string;
  readonly axis: Axis;
  readonly blockId: string;
  readonly kind: TermKind;
  readonly name: string;
  readonly sentence: string;
}

const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z*`[(])/g;

// Why: core's folder is both its layer's and its one block's, so its name is the block's id.
const layersAboveBlocks: readonly string[] = Object.values(BlockLayer).filter(
  (layer) => layer !== BlockLayer.Core,
);

const axisOf = (blockPath: BlockPath): Axis =>
  blockPath
    .split(PATH_SEPARATOR)
    .map(axisOfFolder)
    .find((axis) => axis !== undefined) ?? Axis.Foundation;

const blockIdOf = (blockPath: BlockPath): string | undefined => {
  const layer = layersAboveBlocks.find((candidate) =>
    blockPath.startsWith(`${candidate}${PATH_SEPARATOR}`),
  );
  const folders = blockPath
    .slice(layer === undefined ? 0 : layer.length + PATH_SEPARATOR.length)
    .split(PATH_SEPARATOR)
    .slice(0, -1);
  const axisIndex = folders.findIndex((folder) => axisOfFolder(folder) !== undefined);
  const idFolders = axisIndex === -1 ? folders : folders.slice(0, axisIndex);

  return idFolders.length === 0 ? undefined : idFolders.join(PATH_SEPARATOR);
};

const sentenceAround = (input: { offset: number; text: string }): string => {
  const breaks = [
    ...input.text.matchAll(SENTENCE_BREAK),
  ];
  const before = breaks.filter((found) => found.index < input.offset).at(-1);
  const after = breaks.find((found) => found.index >= input.offset);

  return input.text
    .slice(
      before === undefined ? 0 : before.index + before[0].length,
      after === undefined ? input.text.length : after.index,
    )
    .trim();
};

/** @throws {InvalidValueError} when the name is empty */
const create = (input: Term): Term => {
  if (input.name.trim() === '') {
    throw new InvalidValueError({
      code: ValueFailure.TermNameEmpty,
      details: {
        value: input.name,
      },
    });
  }

  return {
    address: input.address,
    axis: input.axis,
    blockId: input.blockId,
    kind: input.kind,
    name: input.name,
    sentence: input.sentence,
  };
};

const compare = (left: Term, right: Term): number =>
  left.name.toLowerCase().localeCompare(right.name.toLowerCase(), 'en') ||
  left.name.localeCompare(right.name, 'en');

const Term = {
  axisOf,
  blockIdOf,
  compare,
  create,
  sentenceAround,
} as const;

export { Term, TermKind };
