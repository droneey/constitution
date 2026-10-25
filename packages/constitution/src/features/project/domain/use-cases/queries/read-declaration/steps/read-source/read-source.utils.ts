import { BLOCKS_FOLDER, MARKDOWN_EXTENSION } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { FileRead } from '#/kernel/entities';
import type { BlockSource } from '#/kernel/value-objects';

import type { CatalogueSource } from '../../../../../entities';
import { joinPath } from '../../../shared/project-paths';

interface ReadSourceInput {
  readonly files: ProjectFiles;
  readonly folder: string;
  readonly source: BlockSource;
  readonly where: string;
}

// The block files of the Constitution or of a pack; a source whose blocks folder cannot be listed
// is not installed.
const readSource = (input: ReadSourceInput): CatalogueSource => {
  const listed = input.files.listFiles(
    joinPath({
      folder: input.folder,
      name: BLOCKS_FOLDER,
    }),
  );

  return {
    ...(listed === undefined
      ? {}
      : {
          files: listed.map((path) => {
            // Stryker disable next-line ConditionalExpression: the catalogue reads only the .md files, so another file's text is never used; it is left unread to save the time
            const text = path.endsWith(MARKDOWN_EXTENSION)
              ? FileRead.textOf(input.files.read(`${input.folder}/${BLOCKS_FOLDER}/${path}`))
              : undefined;

            return {
              path: `${BLOCKS_FOLDER}/${path}`,
              // Stryker disable next-line ConditionalExpression: the catalogue reads a text left undefined as one left out
              ...(text === undefined
                ? {}
                : {
                    text,
                  }),
            };
          }),
        }),
    source: input.source,
    where: input.where,
  };
};

export { readSource };
