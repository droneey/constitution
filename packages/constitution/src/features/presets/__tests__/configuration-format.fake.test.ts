import { createFakeConfigurationFormat } from './configuration-format.fake';
import { runConfigurationFormatSuite } from './configuration-format.suite';

runConfigurationFormatSuite({
  format: createFakeConfigurationFormat(),
  name: 'createFakeConfigurationFormat',
});
