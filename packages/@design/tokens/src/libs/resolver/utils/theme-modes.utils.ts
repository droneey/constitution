import { fileURLToPath } from 'node:url';

import type { Resolver, Source, ThemeModeFiles } from '../types';

/** Each mode of the resolver's `theme` modifier, its files resolved from `resolverUrl`. */
const themeModesOf = (resolver: Resolver, resolverUrl: string): ThemeModeFiles[] => {
  const pathsOf = (sources: readonly Source[]): string[] =>
    sources.map(({ $ref }) => fileURLToPath(new URL($ref, resolverUrl)));

  const shared = Object.values(resolver.sets).flatMap(({ sources }) => pathsOf(sources));

  return Object.entries(resolver.modifiers.theme.contexts).map(([name, sources]) => ({
    name,
    isDefault: name === resolver.modifiers.theme.default,
    shared,
    own: pathsOf(sources),
  }));
};

export { themeModesOf };
