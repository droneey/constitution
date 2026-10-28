enum SpawnErrorCode {
  TimedOut = 'ETIMEDOUT',
  OutputPastLimit = 'ENOBUFS',
}

const spawnErrorCodeOf = (error: Error): unknown => ('code' in error ? error.code : undefined);

export { SpawnErrorCode, spawnErrorCodeOf };
