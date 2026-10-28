import type { UnitRelativePath } from '#/kernel/value-objects';

import type { SpecRunInput, SpecRunner } from '../domain/contracts';
import { SpecRunStatus } from '../domain/entities';

interface FakeSpecs {
  /** a run that holds one of them fails, naming it in its error output */
  readonly failingPaths?: readonly UnitRelativePath[];
  readonly specPaths: readonly UnitRelativePath[];
  /** a run that holds one of them outlasts its time */
  readonly waitingPaths?: readonly UnitRelativePath[];
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

      if (run.specPaths.some((specPath) => fakeSpecs.waitingPaths?.includes(specPath))) {
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
