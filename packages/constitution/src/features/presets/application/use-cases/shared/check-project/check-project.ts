import { FileComputed } from '../../../../domain/apply-plan/entities';
import type { ConfigurationsCheck } from '../../../../domain/configurations-check/entities';
import type { ComputeChangesInput } from '../compute-changes';
import { computeChanges } from '../compute-changes';
import { findReleaseLoops } from './steps/find-release-loops';

const checkProject = (input: ComputeChangesInput): ConfigurationsCheck => {
  const { project } = input;
  const { files, presetsFindings, units } = computeChanges(input);

  return {
    findings: [
      ...presetsFindings,
      ...units.flatMap((unit) => unit.findings),
      ...files.flatMap((file) => [
        ...file.findings,
        ...FileComputed.driftOf(file),
      ]),
    ],
    warnings: findReleaseLoops({
      files: input.files,
      repositoryFolderPath: project.repositoryFolderPath,
      units: project.units,
    }),
  };
};

export { checkProject };
