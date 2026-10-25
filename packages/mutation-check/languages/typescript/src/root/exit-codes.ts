// The codes the check ends by of its own; a Stryker run ends it by Stryker's.
enum ExitCode {
  Success = 0,
  // the check could not finish: git, the configuration or a defect
  Stopped = 2,
}

export { ExitCode };
