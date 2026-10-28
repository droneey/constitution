import {
  BLOCKS_FOLDER_NAME,
  MARKDOWN_EXTENSION,
  PATH_SEPARATOR,
  PRESETS_FOLDER_NAME,
} from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import type { BlockSource, PackPath } from '#/kernel/value-objects';
import { AbsolutePath, SourceKind } from '#/kernel/value-objects';

import type { BlockSetSource, SourceFile } from '../../../../../entities';
import { SourceStatus } from '../../../../../entities';

interface ReadSourceInput {
  readonly files: ProjectFiles;
  readonly folderPath: AbsolutePath;
  /** the folder as a warning names it: the release's own, or the pack's as its unit lists it */
  readonly shownFolderPath: AbsolutePath | PackPath;
  readonly source: BlockSource;
}

const isPresetsPack = (input: ReadSourceInput): boolean =>
  input.source.kind === SourceKind.Pack &&
  input.files.isFolder(AbsolutePath.join(input.folderPath, PRESETS_FOLDER_NAME));

const sourceFileOf = (input: { path: string; read: FileRead }): SourceFile =>
  input.read.status === FileReadStatus.Read
    ? {
        path: input.path,
        status: FileReadStatus.Read,
        text: input.read.text,
      }
    : {
        path: input.path,
        status: FileReadStatus.Unreadable,
      };

/**
 * The markdown files of the Constitution's or a pack's blocks folder, the only ones a block is read
 * from; a source whose blocks folder cannot be listed is not installed, save a pack that holds
 * presets alone, and then no block.
 */
const readSource = (input: ReadSourceInput): BlockSetSource => {
  const blocksFolderPath = AbsolutePath.join(input.folderPath, BLOCKS_FOLDER_NAME);
  const listed = input.files.listFiles(blocksFolderPath);

  if (listed === undefined) {
    return isPresetsPack(input)
      ? {
          files: [],
          shownFolderPath: input.shownFolderPath,
          source: input.source,
          status: SourceStatus.Listed,
        }
      : {
          shownFolderPath: input.shownFolderPath,
          source: input.source,
          status: SourceStatus.Unlisted,
        };
  }

  return {
    files: listed
      .filter((pathInBlocks) => pathInBlocks.endsWith(MARKDOWN_EXTENSION))
      .map((pathInBlocks) =>
        sourceFileOf({
          path: `${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}${pathInBlocks}`,
          read: input.files.read(AbsolutePath.join(blocksFolderPath, pathInBlocks)),
        }),
      ),
    shownFolderPath: input.shownFolderPath,
    source: input.source,
    status: SourceStatus.Listed,
  };
};

export { readSource };
