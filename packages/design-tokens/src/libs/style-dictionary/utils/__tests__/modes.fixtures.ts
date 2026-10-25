import type { Config } from 'style-dictionary/types';

import type { ThemeMode, ThemeModeFiles } from '#/libs/resolver';

/** a platform's configuration that names tokens of its own and hands back the mode it receives */
const echoConfigOf = (mode: ThemeMode): Config => ({
  source: [
    'platform.tokens.json',
  ],
  platforms: {
    css: {
      options: {
        mode,
      },
    },
  },
});

const themeModes: readonly ThemeModeFiles[] = [
  {
    name: 'light',
    isDefault: true,
    shared: [
      '/tokens/color.tokens.json',
      '/tokens/size.tokens.json',
    ],
    own: [
      '/tokens/theme/light.tokens.json',
    ],
  },
  {
    name: 'dark',
    isDefault: false,
    shared: [
      '/tokens/color.tokens.json',
      '/tokens/size.tokens.json',
    ],
    own: [
      '/tokens/theme/dark.tokens.json',
    ],
  },
];

export { echoConfigOf, themeModes };
