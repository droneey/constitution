import type { ProjectWarning } from '#/kernel/entities';

enum ConfigurationsCheckStatus {
  Checked = 'checked',
  Unchecked = 'unchecked',
}

type ConfigurationsReport =
  | {
      readonly status: ConfigurationsCheckStatus.Checked;
      readonly warnings: readonly ProjectWarning[];
    }
  | {
      readonly reason?: string;
      readonly status: ConfigurationsCheckStatus.Unchecked;
    };

export type { ConfigurationsReport };
export { ConfigurationsCheckStatus };
