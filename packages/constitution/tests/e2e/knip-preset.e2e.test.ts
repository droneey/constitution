import { describe, expect, it } from 'bun:test';

import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

const MEMBER_CONSTITUTION =
  'name: orders\naxes: []\ndomains: []\nplatforms: []\nlanguages: []\nimplementations: []\npacks: []\noverrides: []\n';

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

  it('should leave a member file the root never imports unreported when knip runs from the root of a workspace', async () => {
    // Act
    const load = await loadOf('knip', {
      command: [
        nodeBinary('knip'),
        '--no-config-hints',
      ],
      files: {
        'package.json':
          '{ "name": "unit", "private": true, "type": "module", "workspaces": ["packages/*"] }\n',
        'packages/orders/constitution.yaml': MEMBER_CONSTITUTION,
        'packages/orders/package.json': '{ "name": "orders", "type": "module" }\n',
        'packages/orders/src/stray.ts': "export const STRAY_KIND = 'stray';\n",
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
