import { describe, expect, it } from 'bun:test';

import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

// A Compose file that keeps every rule the presets set.
const COMPOSE = `name: shop

services:
  api:
    image: shop/api:1.4.0
    restart: unless-stopped
    ports:
      - '127.0.0.1:3000:3000'
`;

describe("the configuration dclint's presets write", () => {
  it('should load in dclint with no rule or key it does not know when a unit follows every block dclint is configured for', async () => {
    // Act
    const load = await loadOf('dclint', {
      command: [
        nodeBinary('dclint'),
        'compose.yaml',
      ],
      files: {
        'compose.yaml': COMPOSE,
      },
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });
});
