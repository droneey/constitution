import { describe, expect, it } from 'bun:test';

import { mutationOf } from './stryker-preset.fixtures';

// Each case runs a whole Stryker process, which takes several seconds on a CI
// runner.
const STRYKER_RUN_MS = 60_000;

const specOf = (input: {
  condition: string;
  price: number;
  tax: number;
}): string =>
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
});
