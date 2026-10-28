import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type Version = Brand<string, 'Version'>;

const RELEASE_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const NUMBER_END = /[.-]/;
const NUMBERS = 3;

const is = (candidate: unknown): candidate is Version =>
  typeof candidate === 'string' && RELEASE_VERSION.test(candidate);

/** @throws {InvalidValueError} when the text is no <major>.<minor>.<patch>[-<pre-release>] */
const create = (text: string): Version => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.Version,
      details: {
        text,
      },
    });
  }

  return text;
};

const equals = (left: Version, right: Version): boolean => left === right;

const numbersOf = (version: Version): readonly number[] =>
  version.split(NUMBER_END, NUMBERS).map(Number);

const compare = (left: Version, right: Version): -1 | 0 | 1 => {
  const rightNumbers = numbersOf(right);
  const difference =
    numbersOf(left)
      .map((number, index) => number - (rightNumbers[index] ?? 0))
      .find((each) => each !== 0) ?? 0;

  if (difference < 0) {
    return -1;
  }

  return difference > 0 ? 1 : 0;
};

const Version = {
  compare,
  create,
  equals,
  is,
} as const;

export { Version };
