import { describe, expect, it } from 'bun:test';

import { scanOfWidestUnit } from './ast-grep-preset.fixtures';

// Why: ast-grep fails to start on a rule or a utility it cannot read, so a scan of a unit with no
// code to report on loads every rule the presets copy and ends clean.
describe("the configuration ast-grep's presets write", () => {
  it('should load every rule and utility when a unit follows every block ast-grep is configured for', () => {
    // Act
    const scan = scanOfWidestUnit();

    // Assert
    expect(scan).toStrictEqual({
      errors: '',
      status: 0,
    });
  });
});
