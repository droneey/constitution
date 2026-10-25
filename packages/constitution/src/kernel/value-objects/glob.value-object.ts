import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

/** A glob of the paths a block governs; a session's state joins globs with spaces, so it holds none. */
type Glob = Brand<string, 'Glob'>;

const ONE_TOKEN = /^\S+$/;

const is = (candidate: unknown): candidate is Glob =>
  typeof candidate === 'string' && ONE_TOKEN.test(candidate);

/** @throws {@link InvalidValueError} when the text is empty or holds whitespace */
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

const equals = (left: Glob, right: Glob): boolean => left === right;

const Glob = {
  create,
  equals,
  is,
} as const;

export { Glob };
