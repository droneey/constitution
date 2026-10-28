// Why: a run ended by a signal exits 128 plus the signal's number, as a shell reports it: SIGINT 2,
// SIGPIPE 13, SIGTERM 15.
enum ExitCode {
  Success = 0,
  Failure = 1,
  Usage = 2,
  Defect = 70,
  Interrupted = 130,
  ClosedPipe = 141,
  Terminated = 143,
}

export { ExitCode };
