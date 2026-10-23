import { describe, expect, it } from 'bun:test';

import { createFakeSessionCommands } from '../../__tests__/session-commands.fake';
import { addReminded } from '../add-reminded.use-case';

describe('addReminded', () => {
  it.each([
    {
      added: [
        {
          agent: undefined,
          ids: [
            'ui',
          ],
          session: 'session-1',
        },
      ],
      agent: '',
      condition: 'the session itself was reminded',
      ids: [
        'ui',
      ],
      session: 'session-1',
    },
    {
      added: [
        {
          agent: 'agent-1',
          ids: [
            'ui',
          ],
          session: 'session-1',
        },
      ],
      agent: 'agent-1',
      condition: 'one of its agents was reminded',
      ids: [
        'ui',
      ],
      session: 'session-1',
    },
    {
      added: [],
      agent: '',
      condition: 'the reminder named no block',
      ids: [],
      session: 'session-1',
    },
    {
      added: [],
      agent: '',
      condition: 'the session is not a plain name',
      ids: [
        'ui',
      ],
      session: '../session-1',
    },
    {
      added: [],
      agent: 'agent/1',
      condition: 'the agent is not a plain name',
      ids: [
        'ui',
      ],
      session: 'session-1',
    },
  ])(
    'should add the blocks named to the list of the session or its agent when $condition',
    ({ added, agent, ids, session }) => {
      // Arrange
      const store = createFakeSessionCommands();

      // Act
      addReminded({
        agent,
        ids,
        session,
        sessions: store.commands,
      });

      // Assert
      expect(store.writes).toStrictEqual({
        added,
        recorded: [],
        saved: [],
      });
    },
  );
});
