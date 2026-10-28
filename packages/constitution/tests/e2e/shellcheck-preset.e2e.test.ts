import { describe, expect, it } from 'bun:test';

import { unknownChecks } from './shellcheck-preset.fixtures';

// ShellCheck skips a check it does not know in its .shellcheckrc, so each check the presets enable
// is named as ShellCheck lists it; a check it lists reports as ShellCheck documents.
describe("the configuration ShellCheck's presets write", () => {
  it('should enable only checks ShellCheck lists when a unit follows every block ShellCheck is configured for', () => {
    // Act
    const unknown = unknownChecks();

    // Assert
    expect(unknown).toStrictEqual([]);
  });
});
