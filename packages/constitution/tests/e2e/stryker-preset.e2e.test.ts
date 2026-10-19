import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { strykerPlugins } from '@droneey/mutation-check/runner';

import bunTest from '../../presets/typescript/stryker/foundation/bun-test.mjs';
import { mutationOf } from './stryker-preset.fixtures';

// Each case runs a whole Stryker process, which takes several seconds on a CI
// runner.
const STRYKER_RUN_MS = 60_000;

const specOf = (input: { condition: string; price: number; tax: number }): string =>
  `import { expect, test } from 'bun:test';\n\nimport { total } from '../order.utils';\n\ntest('should add the tax when ${input.condition}', () => {\n  expect(total(${String(input.price)}, ${String(input.tax)})).toBe(${String(input.price + input.tax)});\n});\n`;

describe('the Stryker preset', () => {
  it(
    'should fail the run and report the survivor when a mutant survives',
    () => {
      // Arrange
      const spec = specOf({
        condition: 'both are zero',
        price: 0,
        tax: 0,
      });

      // Act
      const mutation = mutationOf(spec);

      // Assert
      expect(mutation).toStrictEqual({
        passed: false,
        survivors: 1,
      });
    },
    STRYKER_RUN_MS,
  );

  it(
    'should pass the run when the spec kills every mutant',
    () => {
      // Arrange
      const spec = specOf({
        condition: 'both are set',
        price: 10,
        tax: 2,
      });

      // Act
      const mutation = mutationOf(spec);

      // Assert
      expect(mutation).toStrictEqual({
        passed: true,
        survivors: 0,
      });
    },
    STRYKER_RUN_MS,
  );

  it(
    'should pass the run when only a log call and the text of an error go unproved',
    () => {
      // Arrange
      const source = `const logger = { info: (message: string, fields: object): void => {} };\n\nexport const total = (price: number, tax: number): number => {\n  if (price < 0) {\n    throw new Error('A price is never negative');\n  }\n  logger.info('Totalled', { price });\n  return price + tax;\n};\n`;
      const spec = `import { expect, test } from 'bun:test';\n\nimport { total } from '../order.utils';\n\ntest('should add the tax when both are set', () => {\n  expect(total(10, 2)).toBe(12);\n});\n\ntest('should refuse a negative price', () => {\n  expect(() => total(-1, 2)).toThrow();\n});\n\ntest('should take a zero price', () => {\n  expect(total(0, 2)).toBe(2);\n});\n`;

      // Act
      const mutation = mutationOf(spec, source);

      // Assert
      expect(mutation).toStrictEqual({
        passed: true,
        survivors: 0,
      });
    },
    STRYKER_RUN_MS,
  );
});

describe("the Stryker preset's runner", () => {
  it('should name the runner the mutation check registers when the preset sets the test runner', () => {
    // Arrange
    const [plugin] = strykerPlugins;

    // Act
    const runner = bunTest.testRunner;

    // Assert
    expect(runner).toBe(plugin.name);
  });

  // Stryker resolves a relative plugin from the folder it runs in, which a unit of a workspace
  // changes.
  it("should name the runner by the path of the archive's build beside the preset when Stryker loads it", () => {
    // Act
    const { plugins } = bunTest;

    // Assert
    expect(plugins).toStrictEqual([
      join(import.meta.dirname, '..', '..', 'tools', 'mutation-check', 'dist', 'runner.js'),
    ]);
  });
});
