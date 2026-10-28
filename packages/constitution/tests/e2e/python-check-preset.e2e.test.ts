import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

describe("the configuration python-check's presets write", () => {
  it('should load in python-check with no key it does not know when a unit follows every block python-check is configured for', async () => {
    // Act
    const load = await loadOf('python-check', {
      command: [
        uvBinary('python-check'),
        'src',
      ],
      files: pythonPackage,
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });
});
