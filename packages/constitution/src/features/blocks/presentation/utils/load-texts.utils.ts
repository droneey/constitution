import {
  AXES,
  BLOCKS_FOLDER_NAME,
  LAYER_FOLDER_NAME,
  LAYERS,
  Layer,
  PATH_SEPARATOR,
} from '#/kernel/constants';
import type { TextsOf } from '#/shared/cli';

import { BlockLoadCode, FrontMatterReadCode, PlaceCode } from '../../domain/block/entities';
import type { LoadFindingDetails } from '../../domain/constitution/entities';
import { LoadCode } from '../../domain/constitution/entities';
import { fieldOf, listOf } from './wording.utils';

const layerFolders = listOf({
  conjunction: 'or',
  names: LAYERS.filter((layer) => layer !== Layer.Core).map((layer) => LAYER_FOLDER_NAME[layer]),
});
const axisFolders = listOf({
  conjunction: 'and',
  names: AXES.map((axis) => `${axis}${PATH_SEPARATOR}`),
});

const loadTexts: TextsOf<LoadFindingDetails> = {
  [BlockLoadCode.SecondaryFrontMatter]: () =>
    'has front matter; only the passport of a block carries it',
  [BlockLoadCode.WithoutPassport]: ({ id }) => `has no passport ${id}.md`,
  [FrontMatterReadCode.Missing]: () => 'has no front matter; a passport opens with it',
  [FrontMatterReadCode.NotYaml]: ({ at, reason }) => {
    if (at === undefined) {
      return `front matter is not valid YAML: ${reason}`;
    }

    const line = `line ${at.line}`;

    return `front matter ${at.key === undefined ? line : `${line} (${at.key})`} is not valid YAML: ${reason}`;
  },
  [FrontMatterReadCode.NotMapping]: () => 'front matter is not a mapping of fields',
  [FrontMatterReadCode.FieldMissing]: ({ field }) =>
    `front matter lacks "${field}"; every block declares every field`,
  [FrontMatterReadCode.FieldUnknown]: ({ key }) =>
    `front matter has "${key}", which is not a field`,
  [FrontMatterReadCode.OutOfOrder]: ({ order }) =>
    `front matter lists its fields out of order; the order is ${order.join(', ')}`,
  [FrontMatterReadCode.OffSchema]: ({ field, reason }) =>
    `front matter: ${fieldOf(field)}: ${reason}`,
  [FrontMatterReadCode.SummaryTooLong]: ({ characters, limit }) =>
    `front matter: summary has ${characters} characters; it holds at most ${limit}`,
  [FrontMatterReadCode.SummaryNotSentence]: () =>
    'front matter: summary is one sentence on one line, ending with a full stop',
  [FrontMatterReadCode.NotBlockId]: ({ entry, field }) =>
    `front matter: ${field} "${entry}", which is not a block id`,
  [FrontMatterReadCode.EntryEmpty]: () => 'front matter: governs holds no empty entry',
  [FrontMatterReadCode.EntryRepeated]: ({ entry, field }) =>
    `front matter: ${field} lists "${entry}" twice`,
  [LoadCode.BaseDoesNotLoad]: () =>
    'is the Constitution this pack extends, and it does not load; check it before the pack',
  [LoadCode.IdShared]: ({ id, others }) =>
    `shares the id "${id}" with ${others.join(', ')}; an id names one block`,
  [PlaceCode.OutsideBlockFolder]: () =>
    `is not inside a block folder; a block is ${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}${LAYER_FOLDER_NAME[Layer.Core]}, or a folder <id>/ in ${layerFolders}`,
  [PlaceCode.StrayBlockFile]: () =>
    `is not a block file; a block holds at its root its passport <id>.md, and in ${axisFolders} its chapters <name>.md and its seams with/<block>.md`,
  [PlaceCode.ChapterNamedAfterBlock]: () =>
    "is named after its block; an axis holds named chapters and seams, and the block's id names only its passport <id>.md",
};

export { loadTexts };
