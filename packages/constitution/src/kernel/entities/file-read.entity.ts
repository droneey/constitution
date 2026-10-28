enum FileReadStatus {
  Read = 'read',
  Missing = 'missing',
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

const causeOf = (read: FileRead): unknown =>
  // Stryker disable next-line ConditionalExpression: no other status carries a cause
  read.status === FileReadStatus.Unreadable ? read.cause : undefined;

const FileRead = {
  causeOf,
} as const;

export { FileRead, FileReadStatus };
