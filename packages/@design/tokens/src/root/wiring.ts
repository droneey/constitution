import type { ExitCode, ThemeModeFiles } from '#/features/themes';
import { AbsolutePath, createGenerateThemes, runGenerateThemes } from '#/features/themes';
import { createConfigModuleLoader } from '#/features/themes/adapters/config-module';
import type { Resolver } from '#/features/themes/adapters/resolver';
import { createResolverThemeModeReader } from '#/features/themes/adapters/resolver';
import { styleDictionaryThemeBuilder } from '#/features/themes/adapters/style-dictionary';

import { withLastResort } from './with-last-resort';

interface ResolverInput {
  readonly resolver: Resolver;
  readonly resolverUrl: URL;
}

interface DesignTokensInput extends ResolverInput {
  readonly args: readonly string[];
  readonly workingFolderPath: string;
  readonly writeError: (text: string) => void;
}

/** @throws {UnknownDefaultModeError} when the modifier's default names no context */
const readThemeModes = (input: ResolverInput): readonly ThemeModeFiles[] =>
  createResolverThemeModeReader(input).read();

const runDesignTokens = (input: DesignTokensInput): Promise<ExitCode> =>
  withLastResort({
    /** @throws {UnknownDefaultModeError} when the modifier's default names no context */
    run: () =>
      runGenerateThemes({
        args: input.args,
        generateThemes: createGenerateThemes({
          builder: styleDictionaryThemeBuilder,
          loader: createConfigModuleLoader({
            workingFolderPath: AbsolutePath.create(input.workingFolderPath),
          }),
          modeReader: createResolverThemeModeReader({
            resolver: input.resolver,
            resolverUrl: input.resolverUrl,
          }),
        }),
        writeError: input.writeError,
      }),
    writeError: input.writeError,
  });

export { readThemeModes, runDesignTokens };
