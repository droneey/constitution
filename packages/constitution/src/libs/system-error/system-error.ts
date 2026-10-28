// Why: an error of the operating system names its code and the call that failed, ENOENT from open;
// an error of the program's own carries a code but no call.
const isSystemError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error && 'syscall' in error;

export { isSystemError };
