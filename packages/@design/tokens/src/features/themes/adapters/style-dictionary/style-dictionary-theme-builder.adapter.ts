import StyleDictionary from 'style-dictionary';
import type { Config } from 'style-dictionary/types';

import { writeWholeWhenChanged } from '#/libs/files';

import type { ConfigOfMode, ThemeBuilder } from '../../domain/contracts';
import type { ThemeModeFiles } from '../../domain/entities';

const configOfModeFiles = (
  configOf: ConfigOfMode,
  { name, isDefault, sharedPaths, ownPaths }: ThemeModeFiles,
): Config => ({
  ...configOf({
    name,
    isDefault,
  }),
  include: [
    ...sharedPaths,
  ],
  source: [
    ...ownPaths,
  ],
});

const writeBuild = async (config: Config): Promise<void> => {
  const dictionary = new StyleDictionary(config);
  const formattedFiles = await Promise.all(
    Object.keys(config.platforms ?? {}).map((platformName) =>
      dictionary.formatPlatform(platformName),
    ),
  );

  for (const { destination, output } of formattedFiles.flat()) {
    // Why: Style Dictionary gives a file that names no destination an empty one, which its own
    // build skips.
    if (
      // Stryker disable next-line ConditionalExpression: Style Dictionary fills in every file's destination, so none is undefined here
      destination !== undefined &&
      destination !== '' &&
      typeof output === 'string'
    ) {
      writeWholeWhenChanged({
        path: destination,
        text: output,
      });
    }
  }
};

const styleDictionaryThemeBuilder: ThemeBuilder = {
  build: async (configOf, modes): Promise<void> => {
    const configs = modes.map((mode) => configOfModeFiles(configOf, mode));

    for (const config of configs) {
      // biome-ignore lint/performance/noAwaitInLoops: Style Dictionary gathers a build's warnings in one global, so two builds at once mix them
      await writeBuild(config);
    }
  },
};

export { styleDictionaryThemeBuilder };
