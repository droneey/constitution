import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../../shared/errors';
import { failureOf } from '../../../shared/errors/__tests__/program-error.fixtures';
import { BlockPath } from '../../../shared/value-objects';
import { Page } from '../page.entity';

describe('Page.sitePathOf', () => {
  it('should name each axis folder of the path by its axis, without its mark', () => {
    // Act
    const sitePath = Page.sitePathOf('domains/people/@architecture/with/@workflow-tools/workflow');

    // Assert
    expect(sitePath).toBe('domains/people/architecture/with/@workflow-tools/workflow');
  });
});

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
      path: 'domains/ui/@foundation/foundation.md',
      slugs: [
        'domains',
        'ui',
        'foundation',
        'foundation',
      ],
    },
    {
      condition: "the file is a chapter, whose axis folder's address drops its mark",
      path: 'core/@foundation/names.md',
      slugs: [
        'core',
        'foundation',
        'names',
      ],
    },
    {
      condition: "the file is the card of a block in its parent's folder",
      path: 'implementations/react/react-dom/react-dom.md',
      slugs: [
        'implementations',
        'react',
        'react-dom',
      ],
    },
    {
      condition: 'the file of a nested axis is named after its axis',
      path: 'domains/people/@workflow/@workflow.md',
      slugs: [
        'domains',
        'people',
        'workflow',
        'workflow',
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
