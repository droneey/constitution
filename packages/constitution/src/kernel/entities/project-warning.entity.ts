// The codes of a project's warnings, in the order the digest gives them.
enum WarningCode {
  Missing = 'missing',
  Abstract = 'abstract',
  Unknown = 'unknown',
  WrongKey = 'wrong-key',
  Config = 'config',
  Pack = 'pack',
  Constitution = 'constitution',
  NotMet = 'not-met',
  Override = 'override',
  Unlisted = 'unlisted',
  Wiring = 'wiring',
  Loop = 'loop',
}

interface ProjectWarning {
  readonly code: WarningCode;
  readonly message: string;
}

export type { ProjectWarning };
export { WarningCode };
