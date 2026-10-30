import { CONFIG_FILE_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace } from '#/kernel/entities';
import { ConfigReadStatus, FileRead, FileReadStatus } from '#/kernel/entities';
import { withoutDotSlash } from '#/kernel/utils';
import { AbsolutePath, BlockSource } from '#/kernel/value-objects';

import type { Declaration } from '../../../../domain/entities';
import { BlockSetSource, ProjectConfig, SourceStatus } from '../../../../domain/entities';
import {
  ReleaseError,
  ReleaseFailure,
  UnreadableFileError,
  UnreadableFileFailure,
} from '../../../../domain/errors';
import { resolveDeclaration } from '../../../../domain/services';
import type {
  BlockCardParser,
  Clock,
  ConfigParser,
  ReleaseManifestParser,
  Workspace,
} from '../../../contracts';
import { readMembers } from './steps/read-members';
import { readSource } from './steps/read-source';

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
  const config = ProjectConfig.create({
    members: members.declared,
    root: read.config,
    unread: members.unread,
  });
  const packs = ProjectConfig.packsOf(config);
  const sources: readonly BlockSetSource[] = [
    release,
    ...packs.map((pack) =>
      readSource({
        files,
        folderPath: AbsolutePath.join(repositoryFolderPath, withoutDotSlash(pack)),
        shownFolderPath: pack,
        source: BlockSource.create(pack),
      }),
    ),
  ];

  return {
    packs,
    resolution: resolveDeclaration({
      cards: new Map(
        BlockSetSource.frontMattersOf(sources).map((frontMatter) => [
          frontMatter,
          input.cardParser.card(frontMatter),
        ]),
      ),
      config,
      sources,
      today: input.clock.today(),
    }),
    status: ConfigReadStatus.Parsed,
  };
};

export type { ProjectPorts };
export { readDeclaration };
