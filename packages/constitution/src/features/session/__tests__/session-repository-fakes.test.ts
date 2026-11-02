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
