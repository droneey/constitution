import { basename } from 'node:path';

import type { PresetFileParser, ReadHeldRulesInput } from '#/features/presets';
import { readHeldRules } from '#/features/presets';
import type { ProjectPorts } from '#/features/project';
import { isProjectError, readDeclaration, readRelease } from '#/features/project';
import type { ActiveRead, ChapterRules } from '#/features/session';
import { ActiveReadStatus } from '#/features/session';
import { PATH_SEPARATOR } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace, WholeHolds } from '#/kernel/entities';
import { ConfigReadStatus, FileReadStatus, ReleaseStatus, StatedRule } from '#/kernel/entities';
import { splitFrontMatter, vocabularyOf } from '#/kernel/utils';
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

interface GateRulesPorts extends ProjectPorts {
  readonly presetFiles: PresetFileParser;
}

const heldRulesOrNoneOf = (input: ReadHeldRulesInput): WholeHolds => {
  try {
    return readHeldRules(input);
  } catch {
    // Why: the boundary of an optional part: any failure of the presets, a defect included, costs
    // the gate only the trimming of held rules, so every rule is given in full.
    return new Map();
  }
};

const readActiveOf = (project: GateRulesPorts, place: ProjectPlace): ActiveRead => {
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
        held: heldRulesOrNoneOf({
          files: project.files,
          parser: project.presetFiles,
          project: {
            ...place,
            lowerings: resolution.lowerings,
            model: resolution.model,
            packs: declaration.packs,
            units: resolution.units,
            warnings: resolution.warnings,
          },
        }),
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

const rulesInOf = (files: ProjectFiles, file: AbsolutePath): ChapterRules | undefined => {
  const read = files.read(file);

  if (read.status !== FileReadStatus.Read) {
    return;
  }

  const { body } = splitFrontMatter(read.text);

  return {
    definitions: vocabularyOf(body),
    wordings: StatedRule.wordingsOf(body),
  };
};

export type { GateRulesPorts };
export { readActiveOf, realPathOf, rulesInOf };
