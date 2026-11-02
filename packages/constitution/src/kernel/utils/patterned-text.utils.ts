import { InvalidValueError } from '../errors';
import type { Brand } from '../types';

interface PatternedTextInput<TCode extends string> {
  readonly code: TCode;
  readonly pattern: RegExp;
}

interface PatternedText<TName extends string> {
  /** @throws {InvalidValueError} when the text does not match the pattern */
  readonly create: (text: string) => Brand<string, TName>;
  readonly is: (candidate: unknown) => candidate is Brand<string, TName>;
}

const patternedTextOf = <TName extends string, TCode extends string = string>(
  input: PatternedTextInput<TCode>,
): PatternedText<TName> => {
  const is = (candidate: unknown): candidate is Brand<string, TName> =>
    typeof candidate === 'string' && input.pattern.test(candidate);

  const create = (text: string): Brand<string, TName> => {
    if (!is(text)) {
      throw new InvalidValueError({
        code: input.code,
        details: {
          text,
        },
      });
    }

    return text;
  };

  return {
    create,
    is,
  };
};

export type { PatternedText };
export { patternedTextOf };
