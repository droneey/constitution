import { ProgramError } from './program.error.ts';

enum ValueFailure {
  AbsolutePath = 'path-not-absolute',
  UnitRelativePath = 'unit-path-not-relative',
}

interface RefusedValue<TCode extends string> {
  readonly code: TCode;
  readonly text: string;
}

/**
 * A defect where the program wrote the text. A feature's value objects name their failures in an enum of their own.
 */
class InvalidValueError<TCode extends string = ValueFailure> extends ProgramError<
  RefusedValue<TCode>
> {
  public constructor(details: RefusedValue<TCode>) {
    super(`${details.code}: ${details.text}`, details);
  }
}

export { InvalidValueError, ValueFailure };
