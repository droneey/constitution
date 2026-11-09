import type { ProjectPlace, Release } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

interface PinnedRelease {
  readonly findProjectAround: (startFolderPath: AbsolutePath) => ProjectPlace | undefined;
  readonly readRelease: (place: ProjectPlace) => Release;
}

export type { PinnedRelease };
