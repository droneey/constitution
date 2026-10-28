import type { AppliedFiles } from './applied-files.entity';
import type { ApplyReport } from './apply-report.entity';
import type { PresetsFinding } from './presets-finding.entity';

enum ApplyPlanKind {
  Ready = 'ready',
  Held = 'held',
}

type ApplyPlan =
  | {
      readonly changes: AppliedFiles;
      readonly kind: ApplyPlanKind.Ready;
      readonly notes: readonly PresetsFinding[];
      readonly report: ApplyReport;
    }
  | {
      readonly findings: readonly PresetsFinding[];
      readonly kind: ApplyPlanKind.Held;
    };

export type { ApplyPlan };
export { ApplyPlanKind };
