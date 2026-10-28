import type { AppliedFiles } from './applied-files.entity';
import type { ApplyReport } from './apply-report.entity';
import type { PresetsFinding } from './presets-finding.entity';

enum ApplyPlanKind {
  Ready = 'ready',
  /** a plan with findings writes nothing, so no run leaves the repository half rewritten */
  Held = 'held',
}

/** What an apply writes and what it reports of it, computed once so the two never part. */
type ApplyPlan =
  | {
      readonly changes: AppliedFiles;
      readonly kind: ApplyPlanKind.Ready;
      /** the findings an apply writes despite, which it tells the person of */
      readonly notes: readonly PresetsFinding[];
      readonly report: ApplyReport;
    }
  | {
      readonly findings: readonly PresetsFinding[];
      readonly kind: ApplyPlanKind.Held;
    };

export type { ApplyPlan };
export { ApplyPlanKind };
