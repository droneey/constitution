import { createFakeConfigModuleLoader } from './config-module-loader.fake';
import {
  configModuleLoaderSuite,
  SCENARIO_CONFIG_PATH,
  UNCONFIGURED_MODE_NAME,
} from './config-module-loader.suite';

configModuleLoaderSuite({
  implementationName: 'the fake',
  loaderOfScenario: () =>
    createFakeConfigModuleLoader(SCENARIO_CONFIG_PATH, ({ name }) =>
      name === UNCONFIGURED_MODE_NAME
        ? 'style-dictionary.config.json'
        : {
            name,
          },
    ),
});
