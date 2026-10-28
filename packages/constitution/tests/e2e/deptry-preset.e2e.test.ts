import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

// deptry prints its scan on every run and has no quiet mode; a key it does not know fails the run.
describe("the configuration deptry's presets write", () => {
  it('should load in deptry with no key it does not know when a unit follows every block deptry is configured for', async () => {
    // Act
    const { status } = await loadOf('deptry', {
      command: [
        uvBinary('deptry'),
        'src',
      ],
      files: pythonPackage,
    });

    // Assert
    expect(status).toBe(0);
  });
});
