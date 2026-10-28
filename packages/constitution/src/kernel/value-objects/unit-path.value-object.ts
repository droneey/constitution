import { CURRENT_SEGMENT, PARENT_SEGMENT, PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';
import { normalizePath } from '../utils';
import { RepositoryRelativePath } from './repository-relative-path.value-object';
import { UnitRelativePath } from './unit-relative-path.value-object';

type UnitPath = Brand<string, 'UnitPath'>;

const REPOSITORY = '';

const isSegment = (segment: string): boolean =>
  segment !== '' && segment !== CURRENT_SEGMENT && segment !== PARENT_SEGMENT;

const is = (candidate: unknown): candidate is UnitPath =>
  typeof candidate === 'string' &&
  (candidate === REPOSITORY || candidate.split(PATH_SEPARATOR).every(isSegment));

/** @throws {InvalidValueError} when the text is no folder written one way */
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

const holds = (unit: UnitPath, path: RepositoryRelativePath | UnitPath): boolean =>
  isRepository(unit) || `${path}${PATH_SEPARATOR}`.startsWith(`${unit}${PATH_SEPARATOR}`);

/** @throws {InvalidValueError} when the path lies outside the unit's folder */
const pathFrom = (unit: UnitPath, path: RepositoryRelativePath | UnitPath): UnitRelativePath => {
  if (!holds(unit, path)) {
    throw new InvalidValueError({
      code: ValueFailure.PathOutsideUnit,
      details: {
        text: path,
      },
    });
  }

  return UnitRelativePath.create(
    isRepository(unit) ? path : path.slice(unit.length + PATH_SEPARATOR.length),
  );
};

const joined = (unit: UnitPath, text: string): string =>
  isRepository(unit) ? text : `${unit}${PATH_SEPARATOR}${text}`;

const pathOf = (unit: UnitPath, path: UnitRelativePath): RepositoryRelativePath =>
  RepositoryRelativePath.create(joined(unit, path));

const resolve = (unit: UnitPath, writtenPath: string): RepositoryRelativePath =>
  RepositoryRelativePath.create(normalizePath(joined(unit, writtenPath)));

const UnitPath = {
  create,
  equals,
  holds,
  is,
  isRepository,
  pathFrom,
  pathOf,
  resolve,
} as const;

const repositoryUnit = UnitPath.create(REPOSITORY);

export { repositoryUnit, UnitPath };
