import { BLOCKS_FOLDER, LAYER_FOLDER, Layer } from '#/kernel/constants';
import { FileRead, FileReadStatus } from '#/kernel/entities';
import { ProjectError, ProjectFailure } from '#/kernel/errors';
import { coreBlockId } from '#/kernel/value-objects';

import type { ReleaseReadInput } from '../shared/release-read';

const corePassport = `${BLOCKS_FOLDER}/${LAYER_FOLDER[Layer.Core]}/${coreBlockId}.md`;

/**
 * The text of core's passport in the release the project pins, which every session's digest gives.
 *
 * @throws {@link ProjectError} when the file cannot be read
 */
const readCore = (input: ReleaseReadInput): string => {
  const path = `${input.place.releaseFolder}/${corePassport}`;
  const read = input.files.read(path);

  if (read.status !== FileReadStatus.Read) {
    throw new ProjectError(
      {
        code: ProjectFailure.CoreUnreadable,
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
