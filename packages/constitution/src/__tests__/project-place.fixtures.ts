import { ProjectPlace } from '#/kernel/entities';

// A project and the folder its release is linked at, as the hooks and the commands find them.

const PROJECT = '/work/project';
const releaseFolderPath = `${PROJECT}/.droneey/constitution`;
const corePassport = `${releaseFolderPath}/blocks/core/core.md`;

const projectPlace = ProjectPlace.create({
  project: PROJECT,
  releaseFolder: releaseFolderPath,
});

export { corePassport, PROJECT, projectPlace, releaseFolderPath };
