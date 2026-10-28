import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

describe("the configuration ruff's presets write", () => {
  it('should load in ruff with no key or rule it does not know when a unit follows every block ruff is configured for', async () => {
    // Act
    const load = await loadOf('ruff', {
      command: [
        uvBinary('ruff'),
        'check',
        '--quiet',
        '--no-cache',
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
