import type { ProjectPlace } from '#/kernel/entities';
import type { AbsolutePath, PackPath } from '#/kernel/value-objects';

import type { ParseFailure } from './project-config.entity';
import type { Resolution } from './resolution.entity';

interface OpenedProject extends ProjectPlace {
  readonly packs: readonly PackPath[];
  readonly resolution: Resolution;
}

enum OpeningStatus {
  Opened = 'opened',
  NoProject = 'no-project',
  ReleaseMissing = 'release-missing',
  ConfigUnparsed = 'config-unparsed',
}

type ProjectOpening =
  | {
      readonly project: OpenedProject;
      readonly status: OpeningStatus.Opened;
    }
  | {
      readonly status: OpeningStatus.NoProject;
    }
  | {
      readonly releaseFolderPath: AbsolutePath;
      readonly status: OpeningStatus.ReleaseMissing;
    }
  | (ParseFailure & {
      readonly status: OpeningStatus.ConfigUnparsed;
    });

export type { OpenedProject, ProjectOpening };
export { OpeningStatus };
