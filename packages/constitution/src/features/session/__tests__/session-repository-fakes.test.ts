import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeGateRepository } from './gate-command-repository.fake';
import { runGateRepositorySuite } from './gate-command-repository.suite';
import { heldSessionsOf } from './session.fixtures';
import { createFakeSessionRepository } from './session-command-repository.fake';
import { createFakeSessionQueries } from './session-query-repository.fake';
import { runSessionRepositorySuite } from './session-repository.suite';

runSessionRepositorySuite({
  name: 'createFakeSessionRepository and createFakeSessionQueries',
  repositoryOf: () => {
    const sessions = heldSessionsOf();

    return {
      ...createFakeSessionQueries(sessions),
      ...createFakeSessionRepository(sessions),
    };
  },
});

runGateRepositorySuite({
  name: 'createFakeGateRepository',
  projectOf: () => AbsolutePath.create('/work/project'),
  repositoryOf: createFakeGateRepository,
});
