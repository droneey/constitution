import { describe, expect, it } from 'bun:test';

import { miseBinary } from './mise.fixtures';
import { loadOf } from './preset-load.fixtures';

describe("the configuration rumdl's presets write", () => {
  it('should load in rumdl with no rule, option or key it does not know when a unit follows every block rumdl is configured for', async () => {
    // Act
    const load = await loadOf('rumdl', {
      command: [
        miseBinary('rumdl'),
        'check',
        '--quiet',
        '--deny-config-warnings',
        'README.md',
      ],
      files: {
        'README.md': '# Unit\n\nA unit of every block rumdl is configured for.\n',
      },
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });
});
