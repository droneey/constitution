import { describe, expect, it } from 'bun:test';

import { Route } from '../routes/api/search';
import { SERVED, serverContentFake } from './server-content.fake';
import { getCallOf, responseOf } from './server-route.fixtures';

const handlers = Route.options.server?.handlers;
const get = typeof handlers === 'object' ? handlers.GET : undefined;

describe('search route', () => {
  it('should serve the search index as JSON', async () => {
    // Act
    const response = await responseOf(get?.(getCallOf(Route.fullPath, serverContentFake(), {})));

    // Assert
    expect(await response.json()).toStrictEqual(SERVED.searchIndex);
  });
});
