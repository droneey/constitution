import { describe, expect, it } from 'bun:test';

import type { ConfigOfMode, ThemeBuilder } from '../domain/contracts';
import type { ThemeModeFiles } from '../domain/entities';

const SCENARIO_MODE_NAMES = [
  'light',
  'dark',
] as const;

interface ThemeBuilderScenario {
  readonly builder: ThemeBuilder;
  readonly configOf: ConfigOfMode;
  readonly modes: readonly ThemeModeFiles[];
  readonly sortedBuiltModeNames: () => readonly string[];
}

const configOfFailingFor =
  (configOf: ConfigOfMode, modeName: string, failure: Error): ConfigOfMode =>
  (mode): object => {
    if (mode.name === modeName) {
      throw failure;
    }

    return configOf(mode);
  };

interface ThemeBuilderSuiteInput {
  readonly implementationName: string;
  readonly scenario: () => ThemeBuilderScenario;
}

const themeBuilderSuite = (input: ThemeBuilderSuiteInput): void => {
  describe(`the ThemeBuilder contract, kept by ${input.implementationName}`, () => {
    it('should build every mode', async () => {
      // Arrange
      const { builder, sortedBuiltModeNames, configOf, modes } = input.scenario();

      // Act
      await builder.build(configOf, modes);

      // Assert
      expect(sortedBuiltModeNames()).toStrictEqual([
        'dark',
        'light',
      ]);
    });

    it('should reject with the failure the configuration of a mode throws', async () => {
      // Arrange
      const { builder, configOf, modes } = input.scenario();
      const failure = new Error('the mode dark has no configuration');
      const failingConfigOf = configOfFailingFor(configOf, 'dark', failure);

      // Act
      const building = builder.build(failingConfigOf, modes);

      // Assert
      await expect(building).rejects.toBe(failure);
    });
  });
};

export { SCENARIO_MODE_NAMES, themeBuilderSuite };
