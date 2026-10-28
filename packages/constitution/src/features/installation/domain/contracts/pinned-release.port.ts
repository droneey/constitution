import type { ProjectPlace, Release } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

/** The release the project around a folder pins, which the doctor diagnoses. */
interface PinnedRelease {
  /** the project around the start folder; undefined when there is none */
  readonly find: (startFolderPath: AbsolutePath) => ProjectPlace | undefined;
  /** the release the project pins, or why it cannot be read */
  readonly readRelease: (place: ProjectPlace) => Release;
}

export type { PinnedRelease };
