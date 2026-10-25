import type { ProjectFiles, ProjectSource, WorkingTree } from '#/kernel/contracts';

interface PresetsPorts {
  readonly files: ProjectFiles;
  readonly source: ProjectSource;
  readonly workingTree: WorkingTree;
}

export type { PresetsPorts };
