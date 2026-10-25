interface ProjectPlace {
  readonly project: string;
  readonly releaseFolder: string;
}

const ProjectPlace = {
  create: (input: ProjectPlace): ProjectPlace => ({
    project: input.project,
    releaseFolder: input.releaseFolder,
  }),
} as const;

export { ProjectPlace };
