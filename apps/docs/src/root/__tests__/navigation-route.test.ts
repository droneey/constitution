import { describe, expect, it } from 'bun:test';

import { Route } from '../routes/api/navigation';
import { SERVED, serverContentFake } from './server-content.fake';
import { getCallOf, responseOf } from './server-route.fixtures';

const handlers = Route.options.server?.handlers;
const get = typeof handlers === 'object' ? handlers.GET : undefined;

describe('navigation route', () => {
  it('should serve the tree of every page as JSON', async () => {
    // Act
    const response = await responseOf(get?.(getCallOf(Route.fullPath, serverContentFake(), {})));

    // Assert
    expect(await response.json()).toStrictEqual(SERVED.navigation);
  });
});
