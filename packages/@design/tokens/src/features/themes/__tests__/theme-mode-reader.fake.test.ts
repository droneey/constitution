import { AbsolutePath } from '../domain/theme-mode/value-objects';
import { createFakeThemeModeReader } from './theme-mode-reader.fake';
import { themeModeReaderSuite } from './theme-mode-reader.suite';

themeModeReaderSuite({
  implementationName: 'the fake',
  readerOfScenario: () =>
    createFakeThemeModeReader(
      [
        'light',
        'dark',
      ].map((name) => ({
        name,
        isDefault: name === 'dark',
        sharedPaths: [],
        ownPaths: [
          AbsolutePath.create(`/tokens/theme/${name}.tokens.json`),
        ],
      })),
    ),
});
