import { describe, expect, it } from 'bun:test';

import { isNotFound } from '@tanstack/react-router';

import { Route } from '../routes/docs/{$}[.]md';
import { SERVED, serverContentFake } from './server-content.fake';
import { getCallOf, responseOf } from './server-route.fixtures';

const handlers = Route.options.server?.handlers;
const get = typeof handlers === 'object' ? handlers.GET : undefined;

/** the address after `/docs/` and before `.md` */
const markdownAt = (splat?: string): Promise<Response> =>
  responseOf(
    get?.(
      getCallOf(
        Route.fullPath,
        serverContentFake(),
        splat === undefined
          ? {}
          : {
              _splat: splat,
            },
      ),
    ),
  );

describe('markdown route', () => {
  it.each([
    {
      condition: 'it names a page',
      expected: SERVED.guide,
      splat: 'guides/write-a-pack',
    },
    {
      condition: 'it names no page, which is the overview',
      expected: SERVED.overview,
      splat: undefined,
    },
  ])(
    'should serve the page as Markdown when the address $condition',
    async ({ expected, splat }) => {
      // Act
      const response = await markdownAt(splat);

      // Assert
      expect([
        response.headers.get('Content-Type'),
        await response.text(),
      ]).toStrictEqual([
        'text/markdown',
        expected,
      ]);
    },
  );

  it.each([
    {
      condition: 'no page has the address',
      splat: 'guides/moved',
    },
    {
      condition: 'no page can have the address',
      splat: 'guides/Moved',
    },
  ])('should answer not found when $condition', async ({ splat }) => {
    // Act
    const answer = await markdownAt(splat).catch((error: unknown) => error);

    // Assert
    expect(isNotFound(answer)).toBe(true);
  });
});
