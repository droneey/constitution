import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { RepositoryRelativePath } from '../repository-relative-path.value-object';
import { UnitPath } from '../unit-path.value-object';
import { UnitRelativePath } from '../unit-relative-path.value-object';

describe('UnitPath', () => {
  it.each([
    {
      condition: 'it is the repository',
      isUnitPath: true,
      text: '',
    },
    {
      condition: 'it is a folder of folders',
      isUnitPath: true,
      text: 'apps/web',
    },
    {
      condition: 'it opens with a slash',
      isUnitPath: false,
      text: '/apps/web',
    },
    {
      condition: 'it ends with a slash',
      isUnitPath: false,
      text: 'apps/web/',
    },
    {
      condition: 'it holds an empty segment',
      isUnitPath: false,
      text: 'apps//web',
    },
    {
      condition: 'it opens with the current folder',
      isUnitPath: false,
      text: './apps',
    },
    {
      condition: 'it steps up a folder',
      isUnitPath: false,
      text: 'apps/../web',
    },
  ])('should tell a unit path when $condition', ({ isUnitPath, text }) => {
    // Act
    const isPath = UnitPath.is(text);

    // Assert
    expect(isPath).toBe(isUnitPath);
  });

  it.each([
    {
      condition: 'it is absent',
      given: undefined,
    },
    {
      condition: 'it is a number',
      given: 42,
    },
  ])('should tell no unit path when $condition', ({ given }) => {
    // Act
    const isValue = UnitPath.is(given);

    // Assert
    expect(isValue).toBe(false);
  });

  it('should refuse a folder written another way', () => {
    // Arrange
    const text = './apps/web';

    // Act
    const create = (): UnitPath => UnitPath.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.UnitPath,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'they are one folder',
      isEqual: true,
      left: 'apps/web',
      right: 'apps/web',
    },
    {
      condition: 'one lies in the other',
      isEqual: false,
      left: 'apps/web',
      right: 'apps/web/kit',
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const paths = [
      UnitPath.create(left),
      UnitPath.create(right),
    ] as const;

    // Act
    const isSame = UnitPath.equals(...paths);

    // Assert
    expect(isSame).toBe(isEqual);
  });

  it.each([
    {
      condition: 'the unit is the repository',
      holds: true,
      path: 'apps/web/a.ts',
      unit: '',
    },
    {
      condition: 'the path lies in the unit',
      holds: true,
      path: 'apps/web/a.ts',
      unit: 'apps/web',
    },
    {
      condition: 'the path is the unit',
      holds: true,
      path: 'apps/web',
      unit: 'apps/web',
    },
    {
      condition: "the path only starts with the unit's name",
      holds: false,
      path: 'apps/webapp/a.ts',
      unit: 'apps/web',
    },
  ])(
    'should say $holds whether the unit holds the path when $condition',
    ({ holds, path, unit }) => {
      // Arrange
      const folder = UnitPath.create(unit);

      // Act
      const isHeld = UnitPath.holds(folder, RepositoryRelativePath.create(path));

      // Assert
      expect(isHeld).toBe(holds);
    },
  );

  it.each([
    {
      condition: 'the unit is the repository',
      expected: 'apps/web/a.ts',
      path: 'apps/web/a.ts',
      unit: '',
    },
    {
      condition: 'the unit is a member',
      expected: 'a.ts',
      path: 'apps/web/a.ts',
      unit: 'apps/web',
    },
  ])(
    'should give a path from the unit for one from the repository when $condition',
    ({ expected, path, unit }) => {
      // Arrange
      const folder = UnitPath.create(unit);

      // Act
      const inner = UnitPath.pathFrom(folder, RepositoryRelativePath.create(path));

      // Assert
      expect<string>(inner).toBe(expected);
    },
  );

  it('should refuse a path from the repository that lies outside the unit', () => {
    // Arrange
    const folder = UnitPath.create('apps/web');
    const path = RepositoryRelativePath.create('apps/api/a.ts');

    // Act
    const inner = (): UnitRelativePath => UnitPath.pathFrom(folder, path);

    // Assert
    expect(inner).toThrow(
      new InvalidValueError({
        code: ValueFailure.PathOutsideUnit,
        details: {
          text: path,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'the unit is the repository',
      expected: 'constitution.yaml',
      path: 'constitution.yaml',
      unit: '',
    },
    {
      condition: 'the unit is a member',
      expected: 'apps/web/constitution.yaml',
      path: 'constitution.yaml',
      unit: 'apps/web',
    },
  ])(
    'should give a path from the repository for one from the unit when $condition',
    ({ expected, path, unit }) => {
      // Arrange
      const folder = UnitPath.create(unit);

      // Act
      const outer = UnitPath.pathOf(folder, UnitRelativePath.create(path));

      // Assert
      expect<string>(outer).toBe(expected);
    },
  );

  it.each([
    {
      condition: 'the unit is the repository',
      expected: 'biome.json',
      unit: '',
      writtenPath: './biome.json',
    },
    {
      condition: 'the path leads up out of a member',
      expected: 'apps/biome.json',
      unit: 'apps/web',
      writtenPath: '../biome.json',
    },
  ])(
    'should write a path from the unit one way as a path from the repository when $condition',
    ({ expected, unit, writtenPath }) => {
      // Arrange
      const folder = UnitPath.create(unit);

      // Act
      const outer = UnitPath.resolve(folder, writtenPath);

      // Assert
      expect<string>(outer).toBe(expected);
    },
  );
});
