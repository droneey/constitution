import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../../errors';
import { BlockPath } from '../../../value-objects';
import { failureOf } from '../../__tests__/entity.fixtures';
import { Page } from '../page.entity';

describe('Page.slugsOf', () => {
  it.each([
    {
      condition: 'the file is its folder card',
      path: 'core/core.md',
      slugs: [
        'core',
      ],
    },
    {
      condition: 'the file is a chapter',
      path: 'core/names.md',
      slugs: [
        'core',
        'names',
      ],
    },
    {
      condition: 'the file is a card deeper down',
      path: 'implementations/bun-test/bun-test.md',
      slugs: [
        'implementations',
        'bun-test',
      ],
    },
    {
      condition: "the file is a platform's card, inside contexts",
      path: 'contexts/platforms/browser/browser.md',
      slugs: [
        'contexts',
        'platforms',
        'browser',
      ],
    },
    {
      condition: 'the file sits at the root',
      path: 'core.md',
      slugs: [
        'core',
      ],
    },
    {
      condition: 'the file of an axis is named after its axis',
      path: 'domains/ui/foundation/foundation.md',
      slugs: [
        'domains',
        'ui',
        'foundation',
        'foundation',
      ],
    },
    {
      condition: 'only a folder above the parent repeats the name',
      path: 'core/names/core.md',
      slugs: [
        'core',
        'names',
        'core',
      ],
    },
  ])('should name the page when $condition', ({ path, slugs }) => {
    // Arrange
    const blockPath = BlockPath.create(path);

    // Act
    const page = Page.slugsOf(blockPath);

    // Assert
    expect<readonly string[]>(page).toStrictEqual(slugs);
  });

  it('should refuse the path when no page can have its address', () => {
    // Arrange
    const blockPath = BlockPath.create('core/Names.md');

    // Act
    const failure = failureOf(() => Page.slugsOf(blockPath));

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.PageSlugsInvalid,
      details: {
        value: 'core/Names',
      },
    });
  });
});
