import type { ExitCode, ThemeModeFiles } from '#/features/themes';
import { AbsolutePath, generateThemes, runGenerateThemes } from '#/features/themes';
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

/** The theme modes the resolver names, read as a run of the generator reads them. */
const readThemeModes = (input: ResolverInput): readonly ThemeModeFiles[] =>
  createResolverThemeModeReader(input).read();

const runDesignTokens = (input: DesignTokensInput): Promise<ExitCode> =>
  withLastResort({
    run: () => {
      const ports = {
        builder: styleDictionaryThemeBuilder,
        loader: createConfigModuleLoader({
          workingFolderPath: AbsolutePath.create(input.workingFolderPath),
        }),
        modeReader: createResolverThemeModeReader({
          resolver: input.resolver,
          resolverUrl: input.resolverUrl,
        }),
      };

      return runGenerateThemes({
        args: input.args,
        generateThemes: (configPath) =>
          generateThemes({
            ...ports,
            configPath,
          }),
        writeError: input.writeError,
      });
    },
    writeError: input.writeError,
  });

export { readThemeModes, runDesignTokens };
