import { AbsolutePath } from '../domain/value-objects';
import { createFakeThemeBuilder } from './theme-builder.fake';
import { SCENARIO_MODE_NAMES, themeBuilderSuite } from './theme-builder.suite';

themeBuilderSuite({
  implementationName: 'the fake',
  scenario: () => {
    const builder = createFakeThemeBuilder();

    return {
      builder,
      sortedBuiltModeNames: () =>
        builder.builds.flatMap(({ modes }) => modes.map(({ name }) => name)).toSorted(),
      configOf: () => ({}),
      modes: SCENARIO_MODE_NAMES.map((name) => ({
        name,
        isDefault: name === 'light',
        sharedPaths: [],
        ownPaths: [
          AbsolutePath.create(`/tokens/theme/${name}.tokens.json`),
        ],
      })),
    };
  },
});
