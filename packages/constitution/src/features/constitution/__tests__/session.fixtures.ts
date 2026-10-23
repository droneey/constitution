import type { ActiveBlock, SessionState } from '../domain/entities';

// The session the specs of the session's hooks keep state for.
const SESSION = 'session-1';

// A block active in the repository, governing every file, with its passport to read.
const activeBlockOf = (overrides: Partial<ActiveBlock> & Pick<ActiveBlock, 'id'>): ActiveBlock => ({
  app: '',
  files: [
    `.droneey/constitution/blocks/domains/${overrides.id}/${overrides.id}.md`,
  ],
  globs: [
    '**',
  ],
  scope: 0,
  ...overrides,
});

// What a session keeps for a project at /work/project that names a check and no block.
const sessionStateOf = (overrides: Partial<SessionState> = {}): SessionState => ({
  active: [],
  check: 'bun run check',
  musts: [],
  project: '/work/project',
  ...overrides,
});

export { activeBlockOf, SESSION, sessionStateOf };
