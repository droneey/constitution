import { describe, expect, it } from 'bun:test';

import { miseBinary } from './mise.fixtures';
import { loadOf } from './preset-load.fixtures';

// Why: read as its configuration, a tombi.toml with a key tombi does not know only warns; linted as
// a file of its own, against tombi's schema, it fails.
describe("the configuration tombi's presets write", () => {
  it('should load in tombi with no key it does not know or finds misplaced when a unit follows every block tombi is configured for', async () => {
    // Act
    const load = await loadOf('tombi', {
      command: [
        miseBinary('tombi'),
        'lint',
        '--quiet',
        'tombi.toml',
      ],
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });
});
