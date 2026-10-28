/** The codes Node gives the error of a child it ended itself. */
enum SpawnErrorCode {
  /** killed at the time it was given */
  TimedOut = 'ETIMEDOUT',
  /** its output ran past the buffer it was given */
  OutputPastLimit = 'ENOBUFS',
}

const spawnErrorCodeOf = (error: Error): unknown => ('code' in error ? error.code : undefined);

export { SpawnErrorCode, spawnErrorCodeOf };
