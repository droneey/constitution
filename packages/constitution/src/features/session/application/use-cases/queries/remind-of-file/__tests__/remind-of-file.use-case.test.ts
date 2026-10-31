import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import {
  activeBlockOf,
  heldSessionsOf,
  keptSession,
  mustOf,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionQueryRepository } from '../../../../../__tests__/session-query-repository.fake';
import type { RemindedBlock } from '../../../../../domain/reminder/entities';
import { SessionAgent } from '../../../../../domain/session/entities';
import { AgentId, SessionId } from '../../../../../domain/session/value-objects';
import { remindOfFile } from '../remind-of-file.use-case';

const ui = activeBlockOf({
  files: [
    'blocks/domains/ui/ui.md',
    'blocks/domains/ui/foundation/ui.md',
  ],
  governs: [
    '**/ui/**',
  ],
  id: 'ui',
});
const typescript = activeBlockOf({
  files: [
    'blocks/contexts/languages/typescript/typescript.md',
  ],
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const oneScreen = mustOf({
  block: 'ui',
  slug: 'one-screen',
});
const labelled = mustOf({
  block: 'ui',
  lowerings: [
    {
      level: Level.May,
      unit: 'web',
    },
  ],
  slug: 'labelled',
});
const savedState = sessionStateOf({
  active: [
    ui,
    typescript,
  ],
  mustsBesideCore: [
    oneScreen,
    mustOf({
      block: 'api',
      slug: 'versioned',
    }),
    labelled,
  ],
});
const uiReminded: RemindedBlock = {
  files: ui.files,
  id: BlockId.create('ui'),
  musts: [
    oneScreen,
    labelled,
  ],
};
const typescriptReminded: RemindedBlock = {
  files: typescript.files,
  id: BlockId.create('typescript'),
  musts: [],
};
const keptAgent = AgentId.create('agent-1');

describe('remindOfFile', () => {
  it.each([
    {
      condition: 'the path is absolute',
      path: '/work/project/src/ui/a.ts',
    },
    {
      condition: 'the path starts with ./',
      path: './src/ui/a.ts',
    },
    {
      condition: 'the path is from the project',
      path: 'src/ui/a.ts',
    },
    {
      condition: 'the path takes a part back',
      path: 'src/api/../ui/a.ts',
    },
  ])(
    'should name every block that governs the file, with its MUST rules, when $condition',
    ({ path }) => {
      // Arrange
      const sessions = createFakeSessionQueryRepository(
        heldSessionsOf({
          state: savedState,
        }),
      );

      // Act
      const reminder = remindOfFile({
        agent: SessionAgent.main,
        path,
        session: keptSession,
        sessions,
      });

      // Assert
      expect(reminder).toStrictEqual({
        blocks: [
          uiReminded,
          typescriptReminded,
        ],
        path: RepositoryRelativePath.create('src/ui/a.ts'),
      });
    },
  );

  it.each<{
    asker: {
      agent: SessionAgent;
    };
    blocks: readonly RemindedBlock[];
    condition: string;
  }>([
    {
      asker: {
        agent: SessionAgent.main,
      },
      blocks: [
        typescriptReminded,
      ],
      condition: 'the session was reminded of one',
    },
    {
      asker: {
        agent: keptAgent,
      },
      blocks: [
        uiReminded,
      ],
      condition: 'an agent was reminded of one and its session of the other',
    },
  ])(
    'should leave out the blocks already named to the session or its agent when $condition',
    ({ asker, blocks }) => {
      // Arrange
      const sessions = createFakeSessionQueryRepository(
        heldSessionsOf({
          reminded: [
            {
              ids: [
                'ui',
              ],
            },
            {
              agent: keptAgent,
              ids: [
                'typescript',
              ],
            },
          ],
          state: savedState,
        }),
      );

      // Act
      const reminder = remindOfFile({
        ...asker,
        path: 'src/ui/a.ts',
        session: keptSession,
        sessions,
      });

      // Assert
      expect(reminder).toStrictEqual({
        blocks,
        path: RepositoryRelativePath.create('src/ui/a.ts'),
      });
    },
  );

  it.each([
    {
      condition: 'none governs the file',
      path: 'README.md',
      state: savedState,
    },
    {
      condition: 'no block is active',
      path: 'src/ui/a.ts',
      state: sessionStateOf(),
    },
  ])('should name no block when $condition', ({ path, state }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        state,
      }),
    );

    // Act
    const reminder = remindOfFile({
      agent: SessionAgent.main,
      path,
      session: keptSession,
      sessions,
    });

    // Assert
    expect(reminder).toStrictEqual({
      blocks: [],
      path: RepositoryRelativePath.create(path),
    });
  });

  it.each([
    {
      condition: 'the session kept no state',
      path: 'src/ui/a.ts',
      session: SessionId.create('session-2'),
    },
    {
      condition: 'the file lies outside the project',
      path: '/work/other/src/ui/a.ts',
      session: keptSession,
    },
    {
      condition: "the file lies in a folder that only starts with the project's name",
      path: '/work/project-two/src/ui/a.ts',
      session: keptSession,
    },
    {
      condition: 'the path from the project leaves it',
      path: '../other/src/ui/a.ts',
      session: keptSession,
    },
  ])('should give no reminder when $condition', ({ path, session }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        state: savedState,
      }),
    );

    // Act
    const reminder = remindOfFile({
      agent: SessionAgent.main,
      path,
      session,
      sessions,
    });

    // Assert
    expect(reminder).toBeUndefined();
  });
});
