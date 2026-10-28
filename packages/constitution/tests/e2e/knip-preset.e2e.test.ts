import { describe, expect, it } from 'bun:test';

import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

describe("the configuration knip's presets write", () => {
  it('should load in knip with no key it does not know when a unit follows every block knip is configured for', async () => {
    // Act
    const load = await loadOf('knip', {
      command: [
        nodeBinary('knip'),
        '--no-config-hints',
      ],
      files: {
        'package.json': '{ "name": "unit", "type": "module" }\n',
        'src/main.ts': "export const ORDER_KIND = 'order';\n",
      },
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });
});
