import { readFileSync } from 'node:fs';

import StyleDictionary from 'style-dictionary';
import type { Config } from 'style-dictionary/types';

/** The files on disk that differ from what the configurations' builds would write; none once they are built. */
const staleFilesOf = async (configs: readonly Config[]): Promise<string[]> => {
  const stale: string[] = [];

  for (const config of configs) {
    // Stryker disable ObjectLiteral,StringLiteral: the verbosity only quiets the check
    const dictionary = new StyleDictionary(config, {
      verbosity: 'silent',
    });
    // Stryker restore ObjectLiteral,StringLiteral
    // biome-ignore lint/performance/noAwaitInLoops: Style Dictionary gathers a build's warnings in one global, so two builds at once mix them
    const files = await Promise.all(
      Object.keys(config.platforms ?? {}).map((platform) => dictionary.formatPlatform(platform)),
    );

    // Stryker disable next-line StringLiteral: Style Dictionary gives every file a destination, an empty one where none is set
    for (const { destination = '', output } of files.flat()) {
      if (readFileSync(destination, 'utf8') !== output) {
        stale.push(destination);
      }
    }
  }

  return stale;
};

export { staleFilesOf };
