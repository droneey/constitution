import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

describe("the configuration poe's presets write", () => {
  it('should load in poe with no key or task it does not know when a unit follows every block poe is configured for', async () => {
    // Act
    const load = await loadOf('poe', {
      command: [
        uvBinary('poe'),
        '-qq',
        '--dry-run',
        'check',
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
