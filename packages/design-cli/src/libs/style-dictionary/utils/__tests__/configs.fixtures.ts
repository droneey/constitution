import type { Resolver } from '@droneey/design-tokens';
import StyleDictionary from 'style-dictionary';

import { configsOf } from '../configs.utils';
import resolver from './design.fixtures.resolver.json' with { type: 'json' };

const resolverPath = new URL('./design.fixtures.resolver.json', import.meta.url).href;

const BUILD_PATH = 'theme/';

const HEADER = '/**\n * Do not edit directly, this file was auto-generated.\n */\n\n';

/** the fixture resolver with one more file every mode takes */
const resolverWith = (file: string): Resolver => ({
  ...resolver,
  sets: {
    ...resolver.sets,
    extra: {
      sources: [
        {
          $ref: file,
        },
      ],
    },
  },
});

/** what each mode's build writes from the fixture resolver, by file */
const outputsOf = async (designResolver: Resolver = resolver): Promise<Record<string, unknown>[]> =>
  Promise.all(
    configsOf(designResolver, resolverPath, BUILD_PATH).map(async (config) => {
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

export { HEADER, outputsOf, resolverWith };
