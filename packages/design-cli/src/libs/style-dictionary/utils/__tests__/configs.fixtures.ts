import { fileURLToPath } from 'node:url';

import StyleDictionary from 'style-dictionary';

import type { ThemeMode } from '../../types';
import { configOf } from '../configs.utils';

const BUILD_PATH = 'theme/';

const HEADER = '/**\n * Do not edit directly, this file was auto-generated.\n */\n\n';

const fixtureModes: readonly ThemeMode[] = [
  {
    name: 'light',
    isDefault: true,
  },
  {
    name: 'dark',
    isDefault: false,
  },
];

const fixturePathOf = (file: string): string => fileURLToPath(new URL(file, import.meta.url));

/**
 * What each mode's build writes from the fixture tokens and `extra`, more files every mode takes,
 * by file, read as the runner of design-tokens reads a resolver's.
 */
const outputsOf = async (extra: readonly string[] = []): Promise<Record<string, unknown>[]> =>
  Promise.all(
    fixtureModes.map(async (mode) => {
      const config = {
        ...configOf(mode, BUILD_PATH),
        include: [
          'base.fixtures.tokens.json',
          ...extra,
        ].map(fixturePathOf),
        source: [
          fixturePathOf(`${mode.name}.fixtures.tokens.json`),
        ],
      };
      const dictionary = new StyleDictionary(config, {
        verbosity: 'silent',
      });
      const files = await Promise.all(
        Object.keys(config.platforms ?? {}).map((platform) => dictionary.formatPlatform(platform)),
      );

      return Object.fromEntries(
        files.flat().map(({ destination, output }) => [
          destination,
          output,
        ]),
      );
    }),
  );

export { HEADER, outputsOf };
