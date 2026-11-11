import { describe, expect, it } from 'bun:test';

import { loadOf, pythonPackage } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

const RULE_CODE = /^\S+:\d+:\d+: ([A-Z]+\d+) /;

const ruleCodesOf = (output: readonly string[]): readonly string[] =>
  output.flatMap((line) => RULE_CODE.exec(line)?.[1] ?? []);

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

  it('should report TID251 when a module imports typing.cast', async () => {
    // Act
    const load = await loadOf('ruff', {
      command: [
        uvBinary('ruff'),
        'check',
        '--quiet',
        '--no-cache',
        '--output-format',
        'concise',
        'src',
      ],
      files: {
        ...pythonPackage,
        'src/unit/order.py':
          '"""Order."""\n\nfrom typing import cast\n\nORDER_TOTAL = cast(\'int\', 1)\n',
      },
    });

    // Assert
    expect(ruleCodesOf(load.output)).toStrictEqual([
      'TID251',
    ]);
  });
});
