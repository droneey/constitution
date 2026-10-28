import { describe, expect, it } from 'bun:test';

import type { ThemeModeReader } from '../domain/contracts';

interface ThemeModeReaderSuiteInput {
  readonly implementationName: string;
  /** a reader whose tokens hold the modes `light` and `dark`, in that order, `dark` the default */
  readonly readerOfScenario: () => ThemeModeReader;
}

const themeModeReaderSuite = (input: ThemeModeReaderSuiteInput): void => {
  describe(`the ThemeModeReader contract, kept by ${input.implementationName}`, () => {
    it('should give every mode of the tokens and mark their default', () => {
      // Arrange
      const reader = input.readerOfScenario();

      // Act
      const modes = reader.read();

      // Assert
      expect(
        modes.map(({ name, isDefault }) => [
          name,
          isDefault,
        ]),
      ).toStrictEqual([
        [
          'light',
          false,
        ],
        [
          'dark',
          true,
        ],
      ]);
    });
  });
};

export { themeModeReaderSuite };
