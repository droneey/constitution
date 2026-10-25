import { formats } from 'style-dictionary/enums';
import type { Config } from 'style-dictionary/types';

const FILE = 'tokens.css';

const OUTPUT =
  '/**\n * Do not edit directly, this file was auto-generated.\n */\n\n:root {\n  --base: #ffffff;\n}\n';

/** one token and no platform to write it */
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

/** a configuration that writes the token as a CSS variable in `buildPath` */
const configOf = (buildPath: string): Config => ({
  ...platformlessConfig,
  platforms: {
    css: {
      buildPath,
      files: [
        {
          destination: FILE,
          format: formats.cssVariables,
        },
      ],
    },
  },
});

export { configOf, FILE, OUTPUT, platformlessConfig };
