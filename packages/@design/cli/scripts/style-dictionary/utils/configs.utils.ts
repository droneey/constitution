import type { ThemeMode } from '@droneey/design-tokens';
import { transforms } from 'style-dictionary/enums';
import type { Config } from 'style-dictionary/types';

import { terminalModule } from './terminal.utils';

const TERMINAL_MODULE_FORMAT = 'terminal/module';

/** The configuration of a mode, writing its own module in `buildPath`. */
const configOf = ({ name: modeName }: ThemeMode, buildPath: string): Config => ({
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
          destination: `${modeName}.gen.ts`,
          format: TERMINAL_MODULE_FORMAT,
        },
      ],
    },
  },
  hooks: {
    formats: {
      [TERMINAL_MODULE_FORMAT]: terminalModule,
    },
  },
});

export { configOf };
