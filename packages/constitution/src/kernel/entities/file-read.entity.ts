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

const FileRead = {
  /** the system's failure, where it refused the read */
  causeOf: (read: FileRead): unknown =>
    read.status === FileReadStatus.Unreadable ? read.cause : undefined,
  textOf: (read: FileRead): string | undefined =>
    read.status === FileReadStatus.Read ? read.text : undefined,
} as const;

export { FileRead, FileReadStatus };
