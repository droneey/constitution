import { CONFIG_FILE_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace } from '#/kernel/entities';
import { ConfigReadStatus, FileRead, FileReadStatus } from '#/kernel/entities';
import { withoutDotSlash } from '#/kernel/utils';
import { AbsolutePath, BlockSource, repositoryUnit } from '#/kernel/value-objects';

import type {
  BlockCardParser,
  Clock,
  ConfigParser,
  ReleaseManifestParser,
  Workspace,
} from '../../../contracts';
import type { Declaration } from '../../../../domain/entities';
import { ProjectConfig, SourceStatus } from '../../../../domain/entities';
import {
  ReleaseError,
  ReleaseFailure,
  UnreadableFileError,
  UnreadableFileFailure,
} from '../../../../domain/errors';
import { readMembers } from './steps/read-members';
import { readSource } from './steps/read-source';
import { resolveDeclaration } from './steps/resolve-declaration';

interface ProjectPorts {
  readonly cardParser: BlockCardParser;
  readonly clock: Clock;
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly manifestParser: ReleaseManifestParser;
  readonly workspace: Workspace;
}

interface ReadDeclarationInput extends ProjectPorts {
  readonly place: ProjectPlace;
}

/**
 * @throws {UnreadableFileError} when constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const readDeclaration = (input: ReadDeclarationInput): Declaration => {
  const { files } = input;
  const { releaseFolderPath, repositoryFolderPath } = input.place;
  const path = AbsolutePath.join(repositoryFolderPath, CONFIG_FILE_NAME);
  const written = files.read(path);

  if (written.status !== FileReadStatus.Read) {
    throw new UnreadableFileError(
      {
        code: UnreadableFileFailure.Config,
        details: {
          path,
        },
      },
      {
        cause: FileRead.causeOf(written),
      },
    );
  }

  const read = input.configParser.parse(written.text);
  const release = readSource({
    files,
    folderPath: releaseFolderPath,
    shownFolderPath: releaseFolderPath,
    source: BlockSource.create(),
  });

  if (release.status === SourceStatus.Unlisted) {
    throw new ReleaseError({
      code: ReleaseFailure.BlocksUnlisted,
      details: {
        path: releaseFolderPath,
      },
    });
  }

  if (read.status === ConfigReadStatus.Unparsed) {
    return read;
  }

  const members = readMembers({
    ...input,
    repositoryFolderPath,
  });
  const config: ProjectConfig = {
    units: [
      {
        config: read.config,
        path: repositoryUnit,
      },
      ...members.declared,
    ],
    unread: members.unread,
  };
  const packs = ProjectConfig.packsOf(config);

  return {
    packs,
    resolution: resolveDeclaration({
      config,
      parser: input.cardParser,
      sources: [
        release,
        ...packs.map((pack) =>
          readSource({
            files,
            folderPath: AbsolutePath.join(repositoryFolderPath, withoutDotSlash(pack)),
            shownFolderPath: pack,
            source: BlockSource.create(pack),
          }),
        ),
      ],
      today: input.clock.today(),
    }),
    status: ConfigReadStatus.Parsed,
  };
};

export type { ProjectPorts };
export { readDeclaration };
