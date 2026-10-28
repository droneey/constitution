import type { ThemeBuilder } from '../domain/contracts';
import type { ThemeModeFiles } from '../domain/entities';

interface Build {
  /** the configuration each mode gave, in the order of the modes */
  readonly configs: readonly object[];
  readonly modes: readonly ThemeModeFiles[];
}

interface FakeThemeBuilder extends ThemeBuilder {
  /** every build it finished, in order */
  readonly builds: readonly Build[];
}

/** a builder that asks each mode's configuration and records the build */
const createFakeThemeBuilder = (): FakeThemeBuilder => {
  const builds: Build[] = [];

  return {
    // the executor turns a throw of `configOf` into a rejection, as the real builder's does
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
