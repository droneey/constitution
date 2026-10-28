import { describe, expect, it } from 'bun:test';

import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

describe("the configuration tsc's presets write", () => {
  it('should load in tsc with no option it does not know when a unit follows every block tsc is configured for', async () => {
    // Act
    const load = await loadOf('tsc', {
      command: [
        nodeBinary('tsc'),
        '--project',
        '.',
        '--noEmit',
      ],
      files: {
        'src/order.ts': "export const ORDER_KIND = 'order';\n",
      },
      isInstalled: true,
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });
});
