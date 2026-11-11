import { describe, expect, it } from 'bun:test';

import { configReadOf } from './mise-preset.fixtures';

describe("the configuration mise's presets write", () => {
  it('should load in mise with no key it does not know when a unit follows every block mise is configured for', async () => {
    // Act
    const read = await configReadOf('mise');

    // Assert
    expect(read).toStrictEqual({
      isConfigListed: true,
      status: 0,
      unknownFields: [],
    });
  });
});
