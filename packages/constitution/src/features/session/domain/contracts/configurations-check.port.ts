import type { OpenedProject, ProjectWarning } from '#/kernel/entities';

enum ConfigurationsCheckStatus {
  Checked = 'checked',
  /** the check failed; the presets are an optional part of the digest */
  Unchecked = 'unchecked',
}

type ConfigurationsReport =
  | {
      readonly status: ConfigurationsCheckStatus.Checked;
      readonly warnings: readonly ProjectWarning[];
    }
  | {
      readonly cause: unknown;
      readonly status: ConfigurationsCheckStatus.Unchecked;
    };

interface ProjectConfigurationsCheck {
  readonly check: (project: OpenedProject) => ConfigurationsReport;
}

export type { ConfigurationsReport, ProjectConfigurationsCheck };
export { ConfigurationsCheckStatus };
