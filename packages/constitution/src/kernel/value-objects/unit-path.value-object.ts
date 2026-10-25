import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

// A unit's folder from the repository, written one way: the repository's own is '', a member's is
// its folder's path with no empty, "." or ".." segment.
type UnitPath = Brand<string, 'UnitPath'>;

const SEPARATOR = '/';
const CURRENT = '.';
const PARENT = '..';
const REPOSITORY = '';

const isSegment = (segment: string): boolean =>
  segment !== '' && segment !== CURRENT && segment !== PARENT;

const is = (candidate: unknown): candidate is UnitPath =>
  typeof candidate === 'string' &&
  (candidate === REPOSITORY || candidate.split(SEPARATOR).every(isSegment));

/** @throws {@link InvalidValueError} when the text is no folder written one way */
const create = (text: string): UnitPath => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.UnitPath,
      details: {
        text,
      },
    });
  }

  return text;
};

const equals = (left: UnitPath, right: UnitPath): boolean => left === right;

const isRepository = (unit: UnitPath): boolean => unit === REPOSITORY;

/** Whether a path from the repository lies in the unit's folder, the folder itself included. */
const holds = (unit: UnitPath, path: string): boolean =>
  isRepository(unit) || `${path}${SEPARATOR}`.startsWith(`${unit}${SEPARATOR}`);

/** A path from the repository as a path from the unit's folder; the path lies in it. */
const pathFrom = (unit: UnitPath, path: string): string =>
  isRepository(unit) ? path : path.slice(unit.length + SEPARATOR.length);

/** A path from the unit's folder as a path from the repository. */
const pathOf = (unit: UnitPath, path: string): string =>
  isRepository(unit) ? path : `${unit}${SEPARATOR}${path}`;

const UnitPath = {
  create,
  equals,
  holds,
  is,
  isRepository,
  pathFrom,
  pathOf,
} as const;

const repositoryUnit = UnitPath.create(REPOSITORY);

export { repositoryUnit, UnitPath };
