import type { ConfigModuleLoader, ThemeBuilder, ThemeModeReader } from '../../../contracts';
import type { ConfigModuleError } from '../../../errors';

interface GenerateThemesInput {
  readonly builder: ThemeBuilder;
  readonly configPath: string;
  readonly loader: ConfigModuleLoader;
  readonly modeReader: ThemeModeReader;
}

/**
 * Builds every mode of the tokens with the configuration the platform's module at `configPath`
 * gives it.
 *
 * @throws a {@link ConfigModuleError} when the module is refused, or gives a mode no configuration
 */
const generateThemes = async (input: GenerateThemesInput): Promise<void> => {
  const configOf = await input.loader.load(input.configPath);

  await input.builder.build(configOf, input.modeReader.read());
};

export { generateThemes };
