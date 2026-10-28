import type { PresetsProject } from '#/features/presets';
import type { OpenedProject } from '#/features/project';

const presetsProjectOf = (opened: OpenedProject): PresetsProject => ({
  model: opened.resolution.model,
  packs: opened.packs,
  releaseFolderPath: opened.releaseFolderPath,
  repositoryFolderPath: opened.repositoryFolderPath,
  units: opened.resolution.units,
  warnings: opened.resolution.warnings,
});

export { presetsProjectOf };
