/**
 * A failure the operating system reports, which names its code and the call that failed: ENOENT
 * from open, EACCES from scandir. An error of the program's own carries a code but no call.
 */
const isSystemError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error && 'syscall' in error;

export { isSystemError };
