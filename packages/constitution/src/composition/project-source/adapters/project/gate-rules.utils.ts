import { basename } from 'node:path';

import type { ProjectPorts } from '#/features/project';
import { isProjectError, readDeclaration, readRelease } from '#/features/project';
import type { ActiveRead } from '#/features/session';
import { ActiveReadStatus } from '#/features/session';
import { PATH_SEPARATOR } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace, RuleWording } from '#/kernel/entities';
import { ConfigReadStatus, FileReadStatus, ReleaseStatus, StatedRule } from '#/kernel/entities';
import { splitFrontMatter, withoutCodeFences } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';

const realPathOf = (files: ProjectFiles, path: AbsolutePath): AbsolutePath => {
  const rest: string[] = [];

  for (let folder = path; folder !== AbsolutePath.root; folder = AbsolutePath.parentOf(folder)) {
    const real = files.realFolder(folder);

    if (real !== undefined) {
      return AbsolutePath.join(real, rest.join(PATH_SEPARATOR));
    }

    rest.unshift(basename(folder));
  }

  return path;
};

const readActiveOf = (project: ProjectPorts, place: ProjectPlace): ActiveRead => {
  const release = readRelease({
    files: project.files,
    manifestParser: project.manifestParser,
    place,
  });

  if (release.status !== ReleaseStatus.Installed) {
    return {
      status: ActiveReadStatus.NoRelease,
    };
  }

  try {
    const declaration = readDeclaration({
      ...project,
      place,
    });

    if (declaration.status === ConfigReadStatus.Unparsed) {
      return {
        lines: declaration.lines,
        status: ActiveReadStatus.Unparsed,
      };
    }

    const { resolution } = declaration;

    return {
      rules: {
        active: resolution.active,
        core: resolution.core,
        levels: new Map(
          resolution.model.rules.map((rule) => [
            rule.slug,
            rule.level,
          ]),
        ),
        lowerings: resolution.lowerings,
        releaseFolderPath: place.releaseFolderPath,
        repositoryFolderPath: place.repositoryFolderPath,
      },
      status: ActiveReadStatus.Read,
    };
  } catch (error) {
    if (!isProjectError(error)) {
      throw error;
    }

    return {
      reason: error.message,
      status: ActiveReadStatus.Failed,
    };
  }
};

const rulesInOf = (files: ProjectFiles, file: AbsolutePath): readonly RuleWording[] | undefined => {
  const read = files.read(file);

  return read.status === FileReadStatus.Read
    ? StatedRule.wordingsOf(withoutCodeFences(splitFrontMatter(read.text).body))
    : undefined;
};

export { readActiveOf, realPathOf, rulesInOf };
