import type { ProjectWarning } from '#/kernel/entities';

import type { PresetsFinding } from '../presets-finding/presets-finding.entity';

interface ConfigurationsCheck {
  readonly findings: readonly PresetsFinding[];
  readonly warnings: readonly ProjectWarning[];
}

export type { ConfigurationsCheck };
