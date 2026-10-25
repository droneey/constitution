import { transforms } from 'style-dictionary/enums';
import type { Config } from 'style-dictionary/types';

import type { ThemeMode } from '../types';
import { terminalModule } from './terminal.utils';

/** The configuration of a mode, writing its own module in `buildPath`. */
const configOf = ({ name: mode }: ThemeMode, buildPath: string): Config => ({
  platforms: {
    terminal: {
      // the module reads no name; a name of its own keeps one step from colliding with another
      transforms: [
        transforms.nameKebab,
        transforms.colorHex,
      ],
      buildPath,
      files: [
        {
          destination: `${mode}.gen.ts`,
          format: 'terminal/module',
        },
      ],
    },
  },
  hooks: {
    formats: {
      'terminal/module': terminalModule,
    },
  },
});

export { configOf };
