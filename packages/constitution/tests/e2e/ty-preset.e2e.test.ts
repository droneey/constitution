import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

describe("the configuration ty's presets write", () => {
  it('should load in ty with no key or rule it does not know when a unit follows every block ty is configured for', async () => {
    // Act
    const load = await loadOf('ty', {
      command: [
        uvBinary('ty'),
        'check',
        '--quiet',
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
