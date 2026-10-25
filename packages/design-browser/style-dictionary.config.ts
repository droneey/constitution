import resolver from '@droneey/design-tokens/tokens/design.resolver.json' with { type: 'json' };

import { configsOf } from '#/libs/style-dictionary';

const BUILD_PATH = 'src/libs/ui/theme/';

export default configsOf(
  resolver,
  import.meta.resolve('@droneey/design-tokens/tokens/design.resolver.json'),
  BUILD_PATH,
);
