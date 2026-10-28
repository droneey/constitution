import { describe, expect, it } from 'bun:test';

import { lockOf } from './uv-preset.fixtures';

describe("the configuration python's presets write", () => {
  it('should give uv every field of [project] it needs, as it reads them, when a unit follows every block python is configured for', async () => {
    // Act
    const lock = await lockOf('python');

    // Assert
    expect(lock).toStrictEqual({
      status: 0,
      warnings: [],
    });
  });
});
