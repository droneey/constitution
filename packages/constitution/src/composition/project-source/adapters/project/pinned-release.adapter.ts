import type { PinnedRelease } from '#/features/installation';
import type { ProjectPorts } from '#/features/project';
import { findProject, readRelease } from '#/features/project';
import type { ProjectPlace, Release } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

const createPinnedRelease = (ports: ProjectPorts): PinnedRelease => ({
  find: (startFolderPath: AbsolutePath): ProjectPlace | undefined =>
    findProject({
      files: ports.files,
      startFolderPath,
    }),
  readRelease: (place: ProjectPlace): Release =>
    readRelease({
      files: ports.files,
      manifestParser: ports.manifestParser,
      place,
    }),
});

export { createPinnedRelease };
