import type { Resolver } from '@droneey/design-tokens';
import { themeModesOf } from '@droneey/design-tokens';
import { transforms } from 'style-dictionary/enums';
import type { Config } from 'style-dictionary/types';

import { terminalModule } from './terminal.utils';

/**
 * A configuration for each mode of the resolver's `theme` modifier, each writing its own module in
 * `buildPath`.
 */
const configsOf = (resolver: Resolver, resolverUrl: string, buildPath: string): Config[] =>
  themeModesOf(resolver, resolverUrl).map(({ name: mode, shared, own }) => ({
    include: [
      ...shared,
    ],
    source: [
      ...own,
    ],
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
  }));

export { configsOf };
