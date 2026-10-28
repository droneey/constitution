/** the codes by which the file system says that nothing lies at a path: no entry, or a file where a folder must be */
const missingPathCodes: ReadonlySet<unknown> = new Set([
  'ENOENT',
  'ENOTDIR',
]);

/** Whether a failure of the file system says that nothing lies at the path it was given. */
const isMissingPathError = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && missingPathCodes.has(error.code);

export { isMissingPathError };
