import { describe, expect, it } from 'bun:test';

import { strykerPlugins } from '@droneey/mutation-check-typescript/runner';

import { appliedConfig, mutationOf, widestWarnings } from './stryker-preset.fixtures';

const STRYKER_RUN_MS = 60_000;

// The specs prove the call, by the count the logger keeps, and never its text.
const LOGGED_SOURCE = `export const counts = { logged: 0 };\n\nconst logger = { info: (message: string): void => {\n  counts.logged += 1;\n} };\n\nexport const total = (price: number, tax: number): number => {\n  if (price < 0) {\n    throw new Error('A price is never negative');\n  }\n  logger.info('Totalled');\n  return price + tax;\n};\n`;
const LOGGED_SPEC = `import { expect, test } from 'bun:test';\n\nimport { counts, total } from '../order.utils';\n\ntest('should add the tax when both are set', () => {\n  expect(total(10, 2)).toBe(12);\n});\n\ntest('should refuse a negative price', () => {\n  expect(() => total(-1, 2)).toThrow();\n});\n\ntest('should take a zero price', () => {\n  expect(total(0, 2)).toBe(2);\n});\n\ntest('should log once when it totals', () => {\n  const before = counts.logged;\n  total(10, 2);\n  expect(counts.logged - before).toBe(1);\n});\n`;

const specOf = (input: { condition: string; price: number; tax: number }): string =>
  `import { expect, test } from 'bun:test';\n\nimport { total } from '../order.utils';\n\ntest('should add the tax when ${input.condition}', () => {\n  expect(total(${String(input.price)}, ${String(input.tax)})).toBe(${String(input.price + input.tax)});\n});\n`;

describe("the configuration Stryker's presets write", () => {
  it(
    'should load in Stryker with no option it warns of when a unit follows every block Stryker is configured for',
    () => {
      // Arrange
      const spec = specOf({
        condition: 'both are set',
        price: 10,
        tax: 2,
      });

      // Act
      const run = widestWarnings(spec);

      // Assert
      expect(run).toStrictEqual({
        passed: true,
        warnings: [],
      });
    },
    STRYKER_RUN_MS,
  );

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
      const mutation = mutationOf({
        spec,
      });

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
      const mutation = mutationOf({
        spec,
      });

      // Assert
      expect(mutation).toStrictEqual({
        passed: true,
        survivors: 0,
      });
    },
    STRYKER_RUN_MS,
  );

  it.each([
    {
      blocks: [
        'pino',
      ],
      condition: 'the unit follows a logging library',
      mutation: {
        passed: true,
        survivors: 0,
      },
    },
    {
      blocks: [],
      condition: 'the unit follows no logging library, whose levels its calls take',
      mutation: {
        passed: false,
        survivors: 1,
      },
    },
  ])(
    "should leave out the text of an error, and of a log call only by its library's entry, when $condition",
    ({ blocks, mutation }) => {
      // Act
      const run = mutationOf({
        blocks,
        source: LOGGED_SOURCE,
        spec: LOGGED_SPEC,
      });

      // Assert
      expect(run).toStrictEqual(mutation);
    },
    STRYKER_RUN_MS,
  );

  it('should name the runner the mutation check registers when the preset sets the test runner', () => {
    // Arrange
    const [plugin] = strykerPlugins;

    // Act
    const runner = appliedConfig().testRunner;

    // Assert
    expect(runner).toBe(plugin.name);
  });

  // Stryker resolves a relative plugin from the folder it runs in, the unit's.
  it("should name the runner and the ignorer by the paths of the distribution's build from the unit when Stryker loads them", () => {
    // Act
    const { plugins } = appliedConfig();

    // Assert
    expect(plugins).toStrictEqual([
      './.droneey/constitution/tools/mutation-check/dist/ignorers.js',
      './.droneey/constitution/tools/mutation-check/dist/runner.js',
    ]);
  });
});
