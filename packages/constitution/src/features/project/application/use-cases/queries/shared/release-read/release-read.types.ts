import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace } from '#/kernel/entities';

interface ReleaseReadInput {
  readonly files: ProjectFiles;
  readonly place: ProjectPlace;
}

export type { ReleaseReadInput };
