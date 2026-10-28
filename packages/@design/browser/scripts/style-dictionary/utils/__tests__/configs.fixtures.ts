import { fileURLToPath } from 'node:url';

import type { ThemeMode } from '@droneey/design-tokens';
import StyleDictionary from 'style-dictionary';

import { MalformedTokenError } from '../../errors';
import { configOf } from '../configs.utils';

const BUILD_PATH = 'theme/';

const SHARED_FIXTURE_FILE_NAMES = [
  'base.fixtures.tokens.json',
  'radius.fixtures.tokens.json',
] as const;

type ModeOutput = Readonly<Record<string, unknown>>;

interface FixtureOutputs {
  readonly dark: ModeOutput;
  readonly light: ModeOutput;
}

const fixturePathOf = (fileName: string): string =>
  fileURLToPath(new URL(fileName, import.meta.url));

const outputOf = async (
  mode: ThemeMode,
  sharedFileNames: readonly string[],
): Promise<ModeOutput> => {
  const config = {
    ...configOf(mode, BUILD_PATH),
    include: sharedFileNames.map(fixturePathOf),
    source: [
      fixturePathOf(`${mode.name}.fixtures.tokens.json`),
    ],
  };
  const dictionary = new StyleDictionary(config, {
    verbosity: 'silent',
  });
  const formattedFiles = await Promise.all(
    Object.keys(config.platforms ?? {}).map((platformName) =>
      dictionary.formatPlatform(platformName),
    ),
  );

  return Object.fromEntries(
    formattedFiles.flat().map(({ destination, output }) => [
      destination,
      output,
    ]),
  );
};

const outputsOf = async (
  sharedFileNames: readonly string[] = SHARED_FIXTURE_FILE_NAMES,
): Promise<FixtureOutputs> => ({
  light: await outputOf(
    {
      name: 'light',
      isDefault: true,
    },
    sharedFileNames,
  ),
  dark: await outputOf(
    {
      name: 'dark',
      isDefault: false,
    },
    sharedFileNames,
  ),
});

const refusalOf = async (build: Promise<unknown>): Promise<unknown> => {
  try {
    await build;
  } catch (error) {
    if (!(error instanceof MalformedTokenError)) {
      throw error;
    }

    return {
      code: error.code,
      tokenName: error.tokenName,
    };
  }

  return undefined;
};

const goldenTextOf = (fileName: string): Promise<string> =>
  Bun.file(new URL(fileName, import.meta.url)).text();

export type { FixtureOutputs };
export { goldenTextOf, outputsOf, refusalOf };
