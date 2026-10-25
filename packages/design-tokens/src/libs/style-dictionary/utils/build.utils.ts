import StyleDictionary from 'style-dictionary';
import type { Config } from 'style-dictionary/types';

import { writeWholeWhenChanged } from '#/libs/files';

/**
 * Writes the files every platform of each configuration declares, one configuration at a time,
 * leaving untouched each that already holds its text; a format that gives no text writes no file,
 * as Style Dictionary's own build does.
 */
const buildAll = async (configs: readonly Config[]): Promise<void> => {
  for (const config of configs) {
    const dictionary = new StyleDictionary(config);
    // biome-ignore lint/performance/noAwaitInLoops: Style Dictionary gathers a build's warnings in one global, so two builds at once mix them
    const files = await Promise.all(
      Object.keys(config.platforms ?? {}).map((platform) => dictionary.formatPlatform(platform)),
    );

    // Stryker disable next-line StringLiteral: Style Dictionary gives every file a destination, an empty one where none is set
    for (const { destination = '', output } of files.flat()) {
      if (typeof output === 'string') {
        writeWholeWhenChanged({
          path: destination,
          text: output,
        });
      }
    }
  }
};

export { buildAll };
