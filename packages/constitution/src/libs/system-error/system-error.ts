/** A failure the operating system reports, which carries its code: ENOENT, EACCES, ELOOP. */
const isSystemError = (error: unknown): boolean => error instanceof Error && 'code' in error;

export { isSystemError };
