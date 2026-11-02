import type { ProjectWarning } from '#/kernel/entities';

import type { PresetsFinding } from '../../shared/entities';

interface ConfigurationsCheck {
  readonly findings: readonly PresetsFinding[];
  readonly warnings: readonly ProjectWarning[];
}

export type { ConfigurationsCheck };
