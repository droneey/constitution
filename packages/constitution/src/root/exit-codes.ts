// The one map of exit codes every command ends by.
enum ExitCode {
  Success = 0,
  // a failure the user can act on
  Failure = 1,
  // an unknown command, a bad flag
  Usage = 2,
  Defect = 70,
  // ended by an interrupt, SIGINT: 128 + 2
  Interrupted = 130,
  // its reader closed standard output, SIGPIPE: 128 + 13
  ClosedPipe = 141,
  // ended by a termination request, SIGTERM: 128 + 15
  Terminated = 143,
}

export { ExitCode };
