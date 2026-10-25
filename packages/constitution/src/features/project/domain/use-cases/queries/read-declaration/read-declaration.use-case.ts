import { CONFIG_FILE } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { Declaration, ProjectPlace } from '#/kernel/entities';
import { ConfigReadStatus, FileRead, FileReadStatus } from '#/kernel/entities';
import { ProjectError, ProjectFailure } from '#/kernel/errors';
import { withoutDotSlash } from '#/kernel/utils';
import { BlockSource, repositoryUnit } from '#/kernel/value-objects';

import type { BlockCardParser, Clock, ConfigParser, Workspace } from '../../../contracts';
import { ProjectConfig } from '../../../entities';
import { joinPath } from '../shared/project-paths';
import { readMembers } from './steps/read-members';
import { readSource } from './steps/read-source';
import { resolveDeclaration } from './steps/resolve-declaration';

interface ProjectPorts {
  readonly cardParser: BlockCardParser;
  readonly clock: Clock;
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly workspace: Workspace;
}

interface ReadDeclarationInput extends ProjectPorts {
  readonly place: ProjectPlace;
}

/**
 * What the constitution.yaml of a project and of each member of its workspace declare, read against
 * the release the project pins and the packs they list.
 *
 * @throws {@link ProjectError} when constitution.yaml cannot be read, or the release's blocks
 * cannot be listed
 */
const readDeclaration = (input: ReadDeclarationInput): Declaration => {
  const { files } = input;
  const { project, releaseFolder } = input.place;
  const path = joinPath({
    folder: project,
    name: CONFIG_FILE,
  });
  const written = files.read(path);

  if (written.status !== FileReadStatus.Read) {
    throw new ProjectError(
      {
        code: ProjectFailure.ConfigUnreadable,
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
    folder: releaseFolder,
    source: BlockSource.create(),
    where: releaseFolder,
  });

  if (release.files === undefined) {
    throw new ProjectError({
      code: ProjectFailure.BlocksUnlisted,
      details: {
        path: releaseFolder,
      },
    });
  }

  if (read.status === ConfigReadStatus.Unparsed) {
    return read;
  }

  const members = readMembers({
    ...input,
    project,
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
            folder: joinPath({
              folder: project,
              name: withoutDotSlash(pack),
            }),
            source: BlockSource.create(pack),
            where: pack,
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
