import type { BlockModel, ProjectPlace, ProjectUnit, ProjectWarning } from '#/kernel/entities';
import type { AbsolutePath, PackPath } from '#/kernel/value-objects';

/** The project whose presets are computed: its blocks, its units and the packs they list. */
interface PresetsProject extends ProjectPlace {
  readonly model: BlockModel;
  // the packs its units list, each once, in the order they are first listed
  readonly packs: readonly PackPath[];
  readonly units: readonly ProjectUnit[];
  /** what is wrong with what the project declares */
  readonly warnings: readonly ProjectWarning[];
}

enum ProjectReadStatus {
  Opened = 'opened',
  NoProject = 'no-project',
  ReleaseMissing = 'release-missing',
  ConfigUnparsed = 'config-unparsed',
}

/** Why the project cannot be read, which the presets report as a failed step. */
type ProjectUnread =
  | {
      readonly status: ProjectReadStatus.NoProject;
    }
  | {
      readonly releaseFolderPath: AbsolutePath;
      readonly status: ProjectReadStatus.ReleaseMissing;
    }
  | {
      /** every line, from 1, constitution.yaml fails at, in order */
      readonly lines: readonly number[];
      readonly status: ProjectReadStatus.ConfigUnparsed;
    };

/** What is read of the project: the answer, where it opened, or why it cannot be read. */
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
