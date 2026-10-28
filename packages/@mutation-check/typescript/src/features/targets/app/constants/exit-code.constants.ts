/** The codes the check ends by of its own; a mutation run ends it by the mutation tool's. */
enum ExitCode {
  Success = 0,
  /** the check could not finish: its arguments, git, the configuration or a defect */
  Stopped = 2,
}

export { ExitCode };
