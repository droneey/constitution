import type { OpenedProject, ProjectWarning } from '#/kernel/entities';

enum WiringCheckStatus {
  Checked = 'checked',
  /** the check failed; the wiring is an optional part of the digest */
  Unchecked = 'unchecked',
}

type WiringReport =
  | {
      readonly status: WiringCheckStatus.Checked;
      readonly warnings: readonly ProjectWarning[];
    }
  | {
      readonly cause: unknown;
      readonly status: WiringCheckStatus.Unchecked;
    };

interface WiringCheck {
  readonly check: (project: OpenedProject) => WiringReport;
}

export type { WiringCheck, WiringReport };
export { WiringCheckStatus };
