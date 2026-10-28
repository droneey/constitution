import type { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRunner } from '../../../contracts';
import type { ChosenSpecsRun, UnitSpecs } from '../../../entities';
import { SpecRunStatus } from '../../../entities';

interface SpecsRequest {
  /** none runs every spec; files run the specs that load any of them */
  readonly filePaths?: readonly UnitRelativePath[];
  readonly signal: AbortSignal;
  readonly timeoutMs: number;
  readonly variables: Readonly<Record<string, string>>;
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
    variables: input.variables,
  });

  return {
    ...specRun,
    specPaths,
  };
};

export type { RunSpecsInput, SpecsRequest };
export { runSpecs };
