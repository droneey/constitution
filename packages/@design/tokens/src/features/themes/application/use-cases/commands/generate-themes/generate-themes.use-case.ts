import type { ConfigModuleLoader, ThemeBuilder, ThemeModeReader } from '../../../contracts';

interface GenerateThemesPorts {
  readonly builder: ThemeBuilder;
  readonly loader: ConfigModuleLoader;
  readonly modeReader: ThemeModeReader;
}

/**
 * @throws {ConfigModuleError} when nothing lies at the path, or the module lies outside the
 * working folder or exports no function; the function it gives throws it when it returns no object
 * for a mode
 * @throws {UnknownDefaultModeError} when the modifier's default names no context
 */
type GenerateThemes = (configPath: string) => Promise<void>;

const createGenerateThemes =
  (ports: GenerateThemesPorts): GenerateThemes =>
  async (configPath: string): Promise<void> => {
    const configOf = await ports.loader.load(configPath);

    await ports.builder.build(configOf, ports.modeReader.read());
  };

export type { GenerateThemes };
export { createGenerateThemes };
