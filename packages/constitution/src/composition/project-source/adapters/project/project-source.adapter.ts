import type { ProjectPorts } from '#/features/project';
import {
  findProject,
  openProject,
  readCore,
  readDeclaration,
  readRelease,
} from '#/features/project';
import type { ProjectSource } from '#/kernel/contracts';
import type { Declaration, OpenedProject, ProjectPlace, Release } from '#/kernel/entities';

const createProjectSource = (ports: ProjectPorts): ProjectSource => ({
  find: (start: string): ProjectPlace | undefined =>
    findProject({
      files: ports.files,
      start,
    }),
  open: (start: string): OpenedProject =>
    openProject({
      ...ports,
      start,
    }),
  readCore: (place: ProjectPlace): string =>
    readCore({
      files: ports.files,
      place,
    }),
  readDeclaration: (place: ProjectPlace): Declaration =>
    readDeclaration({
      ...ports,
      place,
    }),
  readRelease: (place: ProjectPlace): Release =>
    readRelease({
      files: ports.files,
      place,
    }),
});

export { createProjectSource };
