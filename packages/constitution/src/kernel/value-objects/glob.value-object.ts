import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { globMatches, globPiecesOf } from '../utils';

type Glob = Brand<string, 'Glob'>;

const is = (candidate: unknown): candidate is Glob =>
  typeof candidate === 'string' && candidate !== '' && globPiecesOf(candidate) !== undefined;

/**
 * @throws {InvalidValueError} when the text is empty or its braces do not pair or nest too
 * deep
 */
const create = (text: string): Glob => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.Glob,
      details: {
        text,
      },
    });
  }

  return text;
};

interface MatchesAnyInput {
  readonly globs: readonly Glob[];
  readonly path: string;
}

const matchesAny = (input: MatchesAnyInput): boolean =>
  input.globs.some((glob) =>
    globMatches({
      glob,
      path: input.path,
    }),
  );

const Glob = {
  create,
  is,
  matchesAny,
} as const;

export { Glob };
