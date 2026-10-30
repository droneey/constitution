import type { ThemeBuilder } from '../application/contracts';
import type { ThemeModeFiles } from '../domain/entities';

interface Build {
  readonly configs: readonly object[];
  readonly modes: readonly ThemeModeFiles[];
}

interface FakeThemeBuilder extends ThemeBuilder {
  readonly builds: readonly Build[];
}

const createFakeThemeBuilder = (): FakeThemeBuilder => {
  const builds: Build[] = [];

  return {
    // Why: the executor turns a throw of `configOf` into a rejection, as the real builder does.
    build: (configOf, modes): Promise<void> =>
      new Promise((resolve) => {
        builds.push({
          configs: modes.map(({ name, isDefault }) =>
            configOf({
              name,
              isDefault,
            }),
          ),
          modes,
        });
        resolve();
      }),
    builds,
  };
};

export { createFakeThemeBuilder };
