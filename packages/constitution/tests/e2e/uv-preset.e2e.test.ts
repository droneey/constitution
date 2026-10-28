import { describe, expect, it } from 'bun:test';

import { lockOf } from './uv-preset.fixtures';

describe("the configuration uv's presets write", () => {
  it('should load in uv with no key under [tool.uv] it does not know when a unit follows every block uv is configured for', async () => {
    // Act
    const lock = await lockOf('uv');

    // Assert
    expect(lock).toStrictEqual({
      status: 0,
      warnings: [],
    });
  });
});
