import StyleDictionary from 'style-dictionary';
import type { Config } from 'style-dictionary/types';

/** Writes the files every platform of each configuration declares, one configuration at a time. */
const buildAll = async (configs: readonly Config[]): Promise<void> => {
  for (const config of configs) {
    // biome-ignore lint/performance/noAwaitInLoops: Style Dictionary gathers a build's warnings in one global, so two builds at once mix them
    await new StyleDictionary(config).buildAllPlatforms();
  }
};

export { buildAll };
