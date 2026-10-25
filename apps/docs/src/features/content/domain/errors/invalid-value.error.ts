import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum ValueFailure {
  TermNameEmpty = 'term-name-empty',
}

interface RefusedValue {
  readonly value: string;
}

/** a value of the content refused what it was asked to hold: a defect of the repository's Markdown */
class InvalidValueError extends ProgramError<ValueFailure, RefusedValue> {
  public constructor(input: ProgramErrorInput<ValueFailure, RefusedValue>) {
    super(input);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'InvalidValueError';
  }
}

export { InvalidValueError, ValueFailure };
