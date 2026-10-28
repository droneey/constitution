import {
  BLOCKS_FOLDER_NAME,
  LAYER_FOLDER_NAME,
  Layer,
  MARKDOWN_EXTENSION,
  PATH_SEPARATOR,
} from '#/kernel/constants';
import { FileRead, FileReadStatus } from '#/kernel/entities';
import { AbsolutePath, coreBlockId } from '#/kernel/value-objects';

import { UnreadableFileError, UnreadableFileFailure } from '../../../errors';
import type { ReleaseReadInput } from '../shared/release-read';

const corePassportPath = [
  BLOCKS_FOLDER_NAME,
  LAYER_FOLDER_NAME[Layer.Core],
  `${coreBlockId}${MARKDOWN_EXTENSION}`,
].join(PATH_SEPARATOR);

/**
 * The text of core's passport in the release the project pins, which every session's digest gives.
 *
 * @throws {@link UnreadableFileError} when the file cannot be read
 */
const readCore = (input: ReleaseReadInput): string => {
  const path = AbsolutePath.join(input.place.releaseFolderPath, corePassportPath);
  const read = input.files.read(path);

  if (read.status !== FileReadStatus.Read) {
    throw new UnreadableFileError(
      {
        code: UnreadableFileFailure.Core,
        details: {
          path,
        },
      },
      {
        cause: FileRead.causeOf(read),
      },
    );
  }

  return read.text;
};

export { readCore };
