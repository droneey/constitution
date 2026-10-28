import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

describe("the configuration vulture's presets write", () => {
  it('should load in vulture with no key it does not know when a unit follows every block vulture is configured for', async () => {
    // Act
    const load = await loadOf('vulture', {
      command: [
        uvBinary('vulture'),
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
