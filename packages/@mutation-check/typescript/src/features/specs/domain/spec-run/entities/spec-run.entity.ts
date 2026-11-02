import type { UnitRelativePath } from '#/kernel/value-objects';

enum SpecRunStatus {
  Passed = 'passed',
  Failed = 'failed',
  TimedOut = 'timed-out',
  Unrun = 'unrun',
}

type SpecRun =
  | {
      readonly status: SpecRunStatus.Failed;
      readonly stderrText: string;
    }
  | {
      readonly status: SpecRunStatus.Passed | SpecRunStatus.TimedOut;
    };

type ChosenSpecsRun =
  | (SpecRun & {
      readonly specPaths: readonly UnitRelativePath[];
    })
  | {
      readonly status: SpecRunStatus.Unrun;
    };

export type { ChosenSpecsRun, SpecRun };
export { SpecRunStatus };
