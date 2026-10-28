import type { ProgramErrorInput } from './program.error';
import { ProgramError } from './program.error';

/** A finding about a malformed value of the Constitution takes the same code. */
enum ValueFailure {
  BlockId = 'id-not-kebab-case',
  RuleSlug = 'slug-not-kebab-case',
  UnitPath = 'unit-path-not-normal',
  PackPath = 'pack-path-empty',
  Version = 'version-not-semantic',
  Glob = 'glob-braces-unpaired',
  AbsolutePath = 'path-not-absolute',
  RepositoryRelativePath = 'repository-relative-path-not-inner',
  UnitRelativePath = 'unit-relative-path-not-inner',
  PathOutsideUnit = 'path-outside-unit',
}

interface RefusedText {
  readonly text: string;
}

/**
 * A value object refused the text it was asked to make: a defect where the program wrote the text.
 * A feature's value objects name their failures in an enum of their own.
 */
class InvalidValueError<TCode extends string = ValueFailure> extends ProgramError<
  TCode,
  RefusedText
> {
  public constructor(input: ProgramErrorInput<TCode, RefusedText>) {
    super(input);
    this.name = 'InvalidValueError';
  }
}

export { InvalidValueError, ValueFailure };
