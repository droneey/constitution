import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum ValueFailure {
  TermNameEmpty = 'term-name-empty',
  PathNotAbsolute = 'path-not-absolute',
  PathOutsideRepository = 'path-outside-repository',
  BlockPathInvalid = 'block-path-invalid',
  PageSlugsInvalid = 'page-slugs-invalid',
  SiteBasePathInvalid = 'site-base-path-invalid',
}

interface RefusedValue {
  readonly value: string;
}

class InvalidValueError extends ProgramError<ValueFailure, RefusedValue> {
  public constructor(input: ProgramErrorInput<ValueFailure, RefusedValue>, options?: ErrorOptions) {
    super(input, options);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'InvalidValueError';
  }
}

export { InvalidValueError, ValueFailure };
