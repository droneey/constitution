enum FileReadStatus {
  Read = 'read',
  /** no regular file is at the path */
  Missing = 'missing',
  /** a file is there, and the system refuses to read it */
  Unreadable = 'unreadable',
}

type FileRead =
  | {
      readonly status: FileReadStatus.Read;
      readonly text: string;
    }
  | {
      readonly status: FileReadStatus.Missing;
    }
  | {
      readonly cause: unknown;
      readonly status: FileReadStatus.Unreadable;
    };

/** The system's failure, where it refused the read. */
const causeOf = (read: FileRead): unknown =>
  // Stryker disable next-line ConditionalExpression: no other status carries a cause
  read.status === FileReadStatus.Unreadable ? read.cause : undefined;

const FileRead = {
  causeOf,
} as const;

export { FileRead, FileReadStatus };
