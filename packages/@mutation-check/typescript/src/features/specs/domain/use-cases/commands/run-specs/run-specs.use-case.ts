import type { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRunner } from '../../../contracts';
import type { ChosenSpecsRun, UnitSpecs } from '../../../entities';
import { SpecRunStatus } from '../../../entities';

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
  const specPaths =
    input.filePaths === undefined
      ? input.unitSpecs.specPaths
      : [
          ...new Set(
            input.filePaths.flatMap(
              (filePath) => input.unitSpecs.specPathsByFilePath.get(filePath) ?? [],
            ),
          ),
        ];

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
