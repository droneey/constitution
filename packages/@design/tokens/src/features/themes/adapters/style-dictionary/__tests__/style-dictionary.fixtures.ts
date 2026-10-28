import { formats } from 'style-dictionary/enums';
import type { Config } from 'style-dictionary/types';

import type { ConfigOfMode } from '../../../domain/contracts';

const FILE_NAME = 'tokens.css';

const platformlessConfig: Config = {
  tokens: {
    color: {
      base: {
        $type: 'color',
        $value: '#ffffff',
      },
    },
  },
  log: {
    verbosity: 'silent',
  },
};

const destinationlessConfigOf = (buildPath: string): Config => ({
  ...platformlessConfig,
  platforms: {
    css: {
      buildPath,
      files: [
        {
          format: formats.cssVariables,
        },
      ],
    },
  },
});

const TEXTLESS_FORMAT = 'textless';

const textlessConfigOf = (buildPath: string): Config => ({
  ...platformlessConfig,
  hooks: {
    formats: {
      [TEXTLESS_FORMAT]: (): object => ({}),
    },
  },
  platforms: {
    css: {
      buildPath,
      files: [
        {
          destination: FILE_NAME,
          format: TEXTLESS_FORMAT,
        },
      ],
    },
  },
});

const TOKEN_PATHS_FORMAT = 'token-paths';

interface ModeTokens {
  readonly modeName: string;
  readonly tokenPaths: readonly string[];
}

const tokenPathsConfigOf =
  (buildPath: string): ConfigOfMode =>
  (mode): Config => ({
    hooks: {
      formats: {
        [TOKEN_PATHS_FORMAT]: ({ dictionary }): string =>
          JSON.stringify({
            modeName: mode.name,
            tokenPaths: dictionary.allTokens.map((token) => token.path.join('.')).toSorted(),
          } satisfies ModeTokens),
      },
    },
    log: {
      verbosity: 'silent',
    },
    platforms: {
      json: {
        buildPath: `${buildPath}/${mode.name}/`,
        files: [
          {
            destination: FILE_NAME,
            format: TOKEN_PATHS_FORMAT,
          },
        ],
      },
    },
  });

const colourTokensText = (name: string): string =>
  JSON.stringify({
    color: {
      [name]: {
        $type: 'color',
        $value: '#ffffff',
      },
    },
  });

export {
  colourTokensText,
  destinationlessConfigOf,
  FILE_NAME,
  platformlessConfig,
  textlessConfigOf,
  tokenPathsConfigOf,
};
