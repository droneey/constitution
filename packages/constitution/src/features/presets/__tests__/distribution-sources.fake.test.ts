import { releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeDistributionSources } from './distribution-sources.fake';
import { runDistributionSourcesSuite } from './distribution-sources.suite';

runDistributionSourcesSuite({
  name: 'createFakeDistributionSources',
  sourcesOf: (world) => ({
    releaseFolderPath: AbsolutePath.create(releaseFolderPath),
    sources: createFakeDistributionSources(world.built),
  }),
});
