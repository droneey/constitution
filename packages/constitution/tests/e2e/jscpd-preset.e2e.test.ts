import { describe, expect, it } from 'bun:test';

import { scanOf } from './jscpd-preset.fixtures';

const typeScriptTotalOf = (step: number): string =>
  `export const total${String(step)} = (price: number, tax: number): number => {\n  const sum = price + tax * ${String(step)};\n\n  return sum > 100 ? sum - 10 : sum + 10;\n};\n`;

const pythonTotalOf = (step: number): string =>
  `def total${String(step)}(price: float, tax: float) -> float:\n    total = price + tax * ${String(step)}\n    if total > 100:\n        return total - 10\n    return total + 10\n`;

// A source file of each language long enough for jscpd to read, as it skips one shorter than its
// least clone.
const sourceOf = (totalOf: (step: number) => string): string =>
  [
    1,
    2,
    3,
    4,
    5,
    6,
  ]
    .map(totalOf)
    .join('\n');

const source = sourceOf(typeScriptTotalOf);
const pythonSource = sourceOf(pythonTotalOf);

describe("the configuration jscpd's presets write", () => {
  it('should load in jscpd with no key it does not know and read the source when a unit follows every block jscpd is configured for', async () => {
    // Act
    const scan = await scanOf({
      'src/order.ts': source,
      'src/unit/order.py': pythonSource,
    });

    // Assert
    expect(scan).toStrictEqual({
      refusals: [],
      sources: 2,
      status: 0,
    });
  });

  // jscpd reads its folders left out and its exit code without a word, so each has a sample it must
  // react to. The least clone, five lines and fifty tokens as the rule names it, is jscpd's own
  // default, so no sample can tell the presets' limits from jscpd's.
  it.each([
    {
      condition: 'two sources share a clone',
      files: {
        'src/invoice.ts': source,
        'src/order.ts': source,
      },
      sources: 2,
      status: 1,
    },
    {
      condition: 'two Python modules share a clone',
      files: {
        'src/unit/invoice.py': pythonSource,
        'src/unit/order.py': pythonSource,
      },
      sources: 2,
      status: 1,
    },
    {
      condition: 'two generated Python modules share a clone the presets leave out',
      files: {
        'src/unit/invoice_gen.py': pythonSource,
        'src/unit/order_gen/__init__.py': pythonSource,
      },
      sources: 0,
      status: 0,
    },
    {
      condition: 'two specs share a clone in the folder of colocated specs the presets leave out',
      files: {
        'src/__tests__/invoice.test.ts': source,
        'src/__tests__/order.test.ts': source,
      },
      sources: 0,
      status: 0,
    },
  ])('should end with $status when $condition', async ({ files, sources, status }) => {
    // Act
    const scan = await scanOf(files);

    // Assert
    expect(scan).toStrictEqual({
      refusals: [],
      sources,
      status,
    });
  });
});
