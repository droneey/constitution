import { describe, expect, it } from 'bun:test';

import { Route } from '../routes/llms-full[.]txt';
import { SERVED, serverContentFake } from './server-content.fake';
import { getCallOf, responseOf } from './server-route.fixtures';

const handlers = Route.options.server?.handlers;
const get = typeof handlers === 'object' ? handlers.GET : undefined;

describe('llms-full.txt route', () => {
  it('should serve the text of every page', async () => {
    // Act
    const response = await responseOf(get?.(getCallOf(Route.fullPath, serverContentFake(), {})));

    // Assert
    expect(await response.text()).toBe(SERVED.fullText);
  });
});
