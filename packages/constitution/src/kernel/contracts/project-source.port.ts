import type { Declaration, OpenedProject, ProjectPlace, Release } from '../entities';

/**
 * The project around a folder, as its constitution.yaml and the release it pins declare it. Each
 * read but find throws a {@link ProjectError} when what it reads is missing or cannot be read.
 */
interface ProjectSource {
  /**
   * the farthest folder with a constitution.yaml at or above the start, up to the root of its
   * repository; undefined when there is none
   */
  readonly find: (start: string) => ProjectPlace | undefined;
  /** the project around the start with what it declares resolved; throws where no project is */
  readonly open: (start: string) => OpenedProject;
  /** the text of core's passport in the release the project pins */
  readonly readCore: (place: ProjectPlace) => string;
  /** what the project and each member of its workspace declare, or where it stops parsing */
  readonly readDeclaration: (place: ProjectPlace) => Declaration;
  /** the release the project pins, or why a session gets only a notice of it */
  readonly readRelease: (place: ProjectPlace) => Release;
}

export type { ProjectSource };
