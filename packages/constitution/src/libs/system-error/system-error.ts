// Why: an error of the operating system names its code and the call that failed, ENOENT from open,
// or its code and number where Bun leaves the call out, as for a name too long; an error of the
// program's own carries a code but neither.
const isSystemError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error && ('syscall' in error || 'errno' in error);

export { isSystemError };
