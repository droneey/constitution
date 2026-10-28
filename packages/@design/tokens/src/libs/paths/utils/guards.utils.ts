// Why: ENOTDIR means a file stands where a folder must be, so nothing lies at the path either.
const missingPathCodes: ReadonlySet<unknown> = new Set([
  'ENOENT',
  'ENOTDIR',
]);

const isMissingPathError = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && missingPathCodes.has(error.code);

export { isMissingPathError };
