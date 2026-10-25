import { heldSessionsOf } from './session.fixtures';
import { createFakeSessionCommandRepository } from './session-command-repository.fake';
import { createFakeSessionQueryRepository } from './session-query-repository.fake';
import { runSessionRepositorySuite } from './session-repository.suite';

runSessionRepositorySuite({
  name: 'createFakeSessionCommandRepository and createFakeSessionQueryRepository',
  repositoryOf: () => {
    const sessions = heldSessionsOf();

    return {
      ...createFakeSessionQueryRepository(sessions),
      ...createFakeSessionCommandRepository(sessions),
    };
  },
});
