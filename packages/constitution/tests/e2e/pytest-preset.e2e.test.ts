import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

const unitWithSpec = {
  ...pythonPackage,
  'tests/test_unit.py': 'def test_should_hold_when_run() -> None:\n  assert True\n',
};

// Why: pytest prints its run and coverage.py its settings on every run, so each case reads the
// status: under the flags given, an option pytest or coverage.py does not know fails the run.
describe("the configuration pytest's presets write", () => {
  it('should load in pytest with no option it does not know when a unit follows every block pytest is configured for', async () => {
    // Act
    const { status } = await loadOf('pytest', {
      command: [
        uvBinary('pytest'),
        '--strict-config',
        '-p',
        'no:cacheprovider',
      ],
      files: unitWithSpec,
    });

    // Assert
    expect(status).toBe(0);
  });

  // Why: coverage.py only warns on an option it does not know, which Python's warnings filter makes
  // an error.
  it('should load in coverage.py with no option it does not know when a unit follows every block pytest is configured for', async () => {
    // Act
    const { status } = await loadOf('pytest', {
      command: [
        uvBinary('python'),
        '-W',
        'error',
        '-m',
        'coverage',
        'debug',
        'config',
      ],
      files: unitWithSpec,
    });

    // Assert
    expect(status).toBe(0);
  });
});
