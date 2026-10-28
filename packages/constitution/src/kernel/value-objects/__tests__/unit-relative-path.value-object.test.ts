import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { UnitRelativePath } from '../unit-relative-path.value-object';

describe('UnitRelativePath', () => {
  it.each([
    {
      condition: "it names a file below a unit's folder",
      given: 'apps/web/biome.json',
      isRelative: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isRelative: true,
    },
    {
      condition: 'it opens with a slash',
      given: '/apps/web/biome.json',
      isRelative: false,
    },
    {
      condition: 'it leaves the folder',
      given: '../web/biome.json',
      isRelative: false,
    },
    {
      condition: 'it names the parent folder',
      given: '..',
      isRelative: false,
    },
    {
      condition: 'it is written with an empty part',
      given: 'apps//biome.json',
      isRelative: false,
    },
    {
      condition: 'it takes a part back',
      given: 'apps/web/../biome.json',
      isRelative: false,
    },
    {
      condition: 'it only starts with two dots',
      given: '..config/biome.json',
      isRelative: true,
    },
    {
      condition: 'it is no text',
      given: 42,
      isRelative: false,
    },
  ])('should say $isRelative when $condition', ({ given, isRelative }) => {
    // Act
    const answer = UnitRelativePath.is(given);

    // Assert
    expect(answer).toBe(isRelative);
  });

  it('should refuse a path that leaves the folder', () => {
    // Arrange
    const text = '../apps/web';

    // Act
    const create = (): UnitRelativePath => UnitRelativePath.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.UnitRelativePath,
        details: {
          text,
        },
      }),
    );
  });
});
