import type { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRunInput, SpecRunner } from '../application/contracts';
import { SpecRunStatus } from '../domain/spec-run/entities';

interface FakeSpecs {
  readonly failingPaths?: readonly UnitRelativePath[];
  readonly specPaths: readonly UnitRelativePath[];
  readonly timingOutPaths?: readonly UnitRelativePath[];
}

interface FakeSpecRunner extends SpecRunner {
  readonly runs: readonly SpecRunInput[];
}

const fakeSpecRunner = (fakeSpecs: FakeSpecs): FakeSpecRunner => {
  const runs: SpecRunInput[] = [];

  return {
    findSpecPaths: () => fakeSpecs.specPaths,
    run: (run) => {
      runs.push(run);

      if (run.specPaths.some((specPath) => fakeSpecs.timingOutPaths?.includes(specPath))) {
        return Promise.resolve({
          status: SpecRunStatus.TimedOut,
        });
      }

      const failedPaths = run.specPaths.filter((specPath) =>
        fakeSpecs.failingPaths?.includes(specPath),
      );

      if (failedPaths.length > 0) {
        return Promise.resolve({
          status: SpecRunStatus.Failed,
          stderrText: failedPaths.join('\n'),
        });
      }

      return Promise.resolve({
        status: SpecRunStatus.Passed,
      });
    },
    runs,
  };
};

export { fakeSpecRunner };
