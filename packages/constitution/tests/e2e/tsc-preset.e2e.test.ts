import { describe, expect, it } from 'bun:test';

import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

const MANIFEST = '{ "name": "unit", "type": "module" }\n';
const ERROR_CODE = /error (TS\d+)/;

const errorCodesOf = (output: readonly string[]): readonly string[] =>
  output.flatMap((line) => ERROR_CODE.exec(line)?.[1] ?? []);

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
        'package.json': MANIFEST,
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

  // Why: the widest unit is a distributed package, which a runtime resolving by file path loads.
  it.each([
    {
      codes: [
        'TS2835',
      ],
      condition: 'a distributed package imports a file without its extension',
      specifier: './order',
    },
    {
      codes: [],
      condition: 'a distributed package imports a file by its extension',
      specifier: './order.ts',
    },
  ])('should report $codes when $condition', async ({ codes, specifier }) => {
    // Act
    const load = await loadOf('tsc', {
      command: [
        nodeBinary('tsc'),
        '--project',
        '.',
        '--noEmit',
      ],
      files: {
        'package.json': MANIFEST,
        'src/order.ts': "export const ORDER_KIND = 'order';\n",
        'src/total.ts': `import { ORDER_KIND } from '${specifier}';\n\nexport const TOTAL_KIND: string = ORDER_KIND;\n`,
      },
      isInstalled: true,
    });

    // Assert
    expect(errorCodesOf(load.output)).toStrictEqual(codes);
  });
});
