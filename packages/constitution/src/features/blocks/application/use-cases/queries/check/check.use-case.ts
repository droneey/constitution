import { BLOCKS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import { AbsolutePath } from '#/kernel/value-objects';

import type { Validation } from '../../../../domain/services';
import { validateConstitution } from '../../../../domain/services';
import type { FileTrees, FrontMatterParser, ManifestParser } from '../../../contracts';
import { loadConstitution } from './steps/load-constitution';

interface PackBase {
  readonly folder: string;
  readonly folderPath: AbsolutePath;
}

interface CheckBlocksInput {
  readonly base?: PackBase;
  readonly files: ProjectFiles;
  readonly folderPath: AbsolutePath;
  readonly frontMatterParser: FrontMatterParser;
  readonly manifestParser: ManifestParser;
  readonly trees: FileTrees;
}

/**
 * @throws {TreeError} when git cannot list the files of a tree, or a file it lists cannot be
 * read
 */
const checkBlocks = (input: CheckBlocksInput): Validation | undefined => {
  const { folderPath, trees } = input;

  if (!input.files.isFolder(AbsolutePath.join(folderPath, BLOCKS_FOLDER_NAME))) {
    return undefined;
  }

  const { constitution, findings } = loadConstitution({
    frontMatterParser: input.frontMatterParser,
    manifestParser: input.manifestParser,
    ...(input.base === undefined
      ? {}
      : {
          base: {
            folder: input.base.folder,
            tree: trees.installed(input.base.folderPath),
          },
        }),
    repository: trees.repository(folderPath),
    tree: trees.tracked(folderPath),
  });

  return validateConstitution({
    constitution,
    findings,
    isPack: input.base !== undefined,
  });
};

export type { CheckBlocksInput, PackBase };
export { checkBlocks };
