import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

const PROJECT = '/work/project';
const releaseFolderPath = `${PROJECT}/.droneey/constitution`;
const corePassport = `${releaseFolderPath}/blocks/core/core.md`;

const projectPlace: ProjectPlace = {
  releaseFolderPath: AbsolutePath.create(releaseFolderPath),
  repositoryFolderPath: AbsolutePath.create(PROJECT),
};

export { corePassport, PROJECT, projectPlace, releaseFolderPath };
