import type { UnitRelativePath } from '#/kernel/value-objects';

import type { ChosenSpecsRun } from '../../../../domain/spec-run/entities';
import { SpecRunStatus } from '../../../../domain/spec-run/entities';
import { UnitSpecs } from '../../../../domain/unit-specs/entities';
import type { SpecRunner } from '../../../contracts';

interface SpecsRequest {
  readonly addedVariables: Readonly<Record<string, string>>;
  readonly filePaths?: readonly UnitRelativePath[];
  readonly signal: AbortSignal;
  readonly timeoutMs: number;
}

interface RunSpecsInput extends SpecsRequest {
  readonly specRunner: SpecRunner;
  readonly unitSpecs: UnitSpecs;
}

const runSpecs = async (input: RunSpecsInput): Promise<ChosenSpecsRun> => {
  const specPaths = UnitSpecs.specPathsFor(input.unitSpecs, input.filePaths);

  if (specPaths.length === 0) {
    return {
      status: SpecRunStatus.Unrun,
    };
  }

  const specRun = await input.specRunner.run({
    signal: input.signal,
    specPaths,
    timeoutMs: input.timeoutMs,
    addedVariables: input.addedVariables,
  });

  return {
    ...specRun,
    specPaths,
  };
};

export type { RunSpecsInput, SpecsRequest };
export { runSpecs };
