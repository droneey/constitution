import type { BlockModel, ProjectPlace, ProjectUnit, ProjectWarning } from '#/kernel/entities';
import type { AbsolutePath, PackPath } from '#/kernel/value-objects';

interface PresetsProject extends ProjectPlace {
  readonly model: BlockModel;
  readonly packs: readonly PackPath[];
  readonly units: readonly ProjectUnit[];
  readonly warnings: readonly ProjectWarning[];
}

enum ProjectReadStatus {
  Opened = 'opened',
  NoProject = 'no-project',
  ReleaseMissing = 'release-missing',
  ConfigUnparsed = 'config-unparsed',
}

type ProjectUnread =
  | {
      readonly status: ProjectReadStatus.NoProject;
    }
  | {
      readonly releaseFolderPath: AbsolutePath;
      readonly status: ProjectReadStatus.ReleaseMissing;
    }
  | {
      readonly lines: readonly number[];
      readonly status: ProjectReadStatus.ConfigUnparsed;
    };

type ProjectRead<TAnswer> =
  | {
      readonly answer: TAnswer;
      readonly status: ProjectReadStatus.Opened;
    }
  | ProjectUnread;

const opened = <TAnswer>(answer: TAnswer): ProjectRead<TAnswer> => ({
  answer,
  status: ProjectReadStatus.Opened,
});

const map = <TFrom, TTo>(
  read: ProjectRead<TFrom>,
  next: (answer: TFrom) => TTo,
): ProjectRead<TTo> =>
  read.status === ProjectReadStatus.Opened ? opened(next(read.answer)) : read;

const ProjectRead = {
  map,
  opened,
} as const;

export type { PresetsProject, ProjectUnread };
export { ProjectRead, ProjectReadStatus };
