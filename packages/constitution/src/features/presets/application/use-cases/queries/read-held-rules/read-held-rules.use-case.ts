import type { ProjectFiles } from '#/kernel/contracts';
import type { WholeHolds } from '#/kernel/entities';

import {
  guardedCandidatesOf,
  heldRulesOf,
  presetsSelectedOf,
} from '../../../../domain/presets-plan/services';
import type { PresetsProject } from '../../../../domain/presets-project/entities';
import type { PresetFileParser } from '../../../contracts';
import { constitutionPathsOf } from '../../shared/compute-presets';
import { loadProjectPresetSets } from '../../shared/load-preset-sets';

interface ReadHeldRulesInput {
  readonly files: ProjectFiles;
  readonly parser: PresetFileParser;
  readonly project: PresetsProject;
}

const readHeldRules = (input: ReadHeldRulesInput): WholeHolds => {
  const { files, project } = input;
  const { model, units } = project;
  const loaded = loadProjectPresetSets(input);

  // Why: a preset set that fails to load leaves its settings unknown, so no rule counts as held
  // and every rule is given in full.
  if (loaded.some((one) => one.findings.length > 0)) {
    return new Map();
  }

  const { candidates } = presetsSelectedOf({
    entries: loaded.flatMap((one) => one.entries),
    model,
    units,
  });

  return heldRulesOf(
    guardedCandidatesOf({
      candidates,
      constitutionPaths: constitutionPathsOf({
        candidates,
        files,
        repositoryFolderPath: project.repositoryFolderPath,
      }),
      model,
      units,
    }),
  );
};

export type { ReadHeldRulesInput };
export { readHeldRules };
