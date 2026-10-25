enum ReadStatus {
  Parsed = 'parsed',
  Mapping = 'mapping',
  NotYaml = 'not-yaml',
  NotJson = 'not-json',
  NotMapping = 'not-a-mapping',
  Mismatched = 'mismatched',
}

interface FieldIssue {
  readonly field: string;
  readonly message: string;
}

export type { FieldIssue };
export { ReadStatus };
