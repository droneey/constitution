import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

// A project and the folder its release is linked at, as the hooks and the commands find them.

const PROJECT = '/work/project';
const releaseFolderPath = `${PROJECT}/.droneey/constitution`;
const corePassport = `${releaseFolderPath}/blocks/core/core.md`;

const projectPlace: ProjectPlace = {
  releaseFolderPath: AbsolutePath.create(releaseFolderPath),
  repositoryFolderPath: AbsolutePath.create(PROJECT),
};

export { corePassport, PROJECT, projectPlace, releaseFolderPath };
