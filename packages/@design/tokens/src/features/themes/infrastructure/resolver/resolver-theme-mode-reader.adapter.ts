import { fileURLToPath } from 'node:url';

import type { ThemeModeReader } from '../../application/contracts';
import type { ThemeModeFiles } from '../../domain/theme-mode/entities';
import { UnknownDefaultModeError } from '../../domain/theme-mode/errors';
import { AbsolutePath } from '../../domain/theme-mode/value-objects';
import type { Resolver, Source } from './models';

interface ResolverThemeModeReaderInput {
  readonly resolver: Resolver;
  readonly resolverUrl: URL;
}

const createResolverThemeModeReader = ({
  resolver,
  resolverUrl,
}: ResolverThemeModeReaderInput): ThemeModeReader => {
  const pathsOf = (sources: readonly Source[]): AbsolutePath[] =>
    sources.map(({ $ref }) => AbsolutePath.create(fileURLToPath(new URL($ref, resolverUrl))));

  return {
    /** @throws {UnknownDefaultModeError} when the modifier's default names no context */
    read: (): ThemeModeFiles[] => {
      const { contexts, default: defaultModeName } = resolver.modifiers.theme;

      if (!Object.hasOwn(contexts, defaultModeName)) {
        throw new UnknownDefaultModeError(defaultModeName);
      }

      const sharedPaths = Object.values(resolver.sets).flatMap(({ sources }) => pathsOf(sources));

      return Object.entries(contexts).map(([name, sources]) => ({
        name,
        isDefault: name === defaultModeName,
        sharedPaths,
        ownPaths: pathsOf(sources),
      }));
    },
  };
};

export { createResolverThemeModeReader };
