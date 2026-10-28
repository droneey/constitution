import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { normalizePath } from '../utils';

type PackPath = Brand<string, 'PackPath'>;

const is = (candidate: unknown): candidate is PackPath =>
  typeof candidate === 'string' && candidate !== '';

/** @throws {InvalidValueError} when the text is empty */
const create = (text: string): PackPath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.PackPath,
      details: {
        text,
      },
    });
  }

  return text;
};

const normalOf = (pack: PackPath): string => normalizePath(`${pack}${PATH_SEPARATOR}.`);

const equals = (left: PackPath, right: PackPath): boolean => normalOf(left) === normalOf(right);

const fromFolder = (pack: PackPath, folder: string): PackPath =>
  create(normalizePath(`${folder}${PATH_SEPARATOR}${pack}${PATH_SEPARATOR}.`));

const PackPath = {
  create,
  equals,
  fromFolder,
  is,
  normalOf,
} as const;

export { PackPath };
