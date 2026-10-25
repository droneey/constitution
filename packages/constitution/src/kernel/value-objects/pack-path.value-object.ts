import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { normalizePath } from '../utils';

// A pack's folder from the repository as constitution.yaml writes it; two paths written otherwise,
// "./rules" and "rules/", name one pack.
type PackPath = Brand<string, 'PackPath'>;

const is = (candidate: unknown): candidate is PackPath =>
  typeof candidate === 'string' && candidate !== '';

/** @throws {@link InvalidValueError} when the text is empty */
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

/** The path written one way: no "./", no ".." it can take back, no trailing "/". */
const normalOf = (pack: PackPath): string => normalizePath(`${pack}/.`);

const equals = (left: PackPath, right: PackPath): boolean => normalOf(left) === normalOf(right);

/** A pack a folder names by a path from it, as a path from the repository written one way. */
const fromFolder = (pack: PackPath, folder: string): PackPath =>
  create(normalizePath(`${folder}/${pack}/.`));

const PackPath = {
  create,
  equals,
  fromFolder,
  is,
  normalOf,
} as const;

export { PackPath };
