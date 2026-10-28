import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import { temporaryFolder } from '#/__tests__/temporary-folder.fixtures';

import { SCENARIO_MODE_NAMES, themeBuilderSuite } from '../../../__tests__/theme-builder.suite';
import type { ThemeModeFiles } from '../../../domain/entities';
import { AbsolutePath } from '../../../domain/value-objects';
import { styleDictionaryThemeBuilder } from '../style-dictionary-theme-builder.adapter';
import {
  colourTokensText,
  destinationlessConfigOf,
  FILE_NAME,
  platformlessConfig,
  textlessConfigOf,
  tokenPathsConfigOf,
} from './style-dictionary.fixtures';

const sandboxPath = temporaryFolder();

const builtPath = (): string => join(sandboxPath(), 'built');

const tokenFileOf = (tokenName: string): AbsolutePath => {
  const filePath = AbsolutePath.create(join(sandboxPath(), `${tokenName}.tokens.json`));

  writeFileSync(filePath, colourTokensText(tokenName));

  return filePath;
};

const scenarioModes = (): ThemeModeFiles[] => {
  const sharedPaths = [
    tokenFileOf('base'),
  ];

  return SCENARIO_MODE_NAMES.map((name) => ({
    name,
    isDefault: name === 'light',
    sharedPaths,
    ownPaths: [
      tokenFileOf(name),
    ],
  }));
};

const modeTokensOf = (modeName: string): unknown =>
  JSON.parse(readFileSync(join(builtPath(), modeName, FILE_NAME), 'utf8'));

themeBuilderSuite({
  implementationName: 'styleDictionaryThemeBuilder',
  scenario: () => ({
    builder: styleDictionaryThemeBuilder,
    builtModeNames: () => (existsSync(builtPath()) ? readdirSync(builtPath()).toSorted() : []),
    configOf: tokenPathsConfigOf(builtPath()),
    modes: scenarioModes(),
  }),
});

describe('styleDictionaryThemeBuilder', () => {
  it('should build each mode from the tokens every mode takes and its own', async () => {
    // Arrange
    const modes = scenarioModes();

    // Act
    await styleDictionaryThemeBuilder.build(tokenPathsConfigOf(builtPath()), modes);

    // Assert
    expect([
      modeTokensOf('light'),
      modeTokensOf('dark'),
    ]).toStrictEqual([
      {
        modeName: 'light',
        tokenPaths: [
          'color.base',
          'color.light',
        ],
      },
      {
        modeName: 'dark',
        tokenPaths: [
          'color.base',
          'color.dark',
        ],
      },
    ]);
  });

  it('should write no file for a format that gives no text', async () => {
    // Arrange
    const modes = scenarioModes();

    // Act
    await styleDictionaryThemeBuilder.build(() => textlessConfigOf(`${builtPath()}/`), modes);

    // Assert
    expect(existsSync(builtPath())).toBe(false);
  });

  it('should write nothing for a file that names no destination', async () => {
    // Arrange
    const modes = scenarioModes();

    // Act
    await styleDictionaryThemeBuilder.build(
      () => destinationlessConfigOf(`${builtPath()}/`),
      modes,
    );

    // Assert
    expect(existsSync(builtPath())).toBe(false);
  });

  it('should build a configuration with no platform', async () => {
    // Arrange
    const modes = scenarioModes();

    // Act
    const built = styleDictionaryThemeBuilder.build(() => platformlessConfig, modes);

    // Assert
    await expect(built).resolves.toBeUndefined();
  });
});
