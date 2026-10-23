import type { SessionMark, SessionState } from '../../../entities';

// What a session keeps between its hooks; a session or a record that was never written reads as absent.
interface SessionQueryRepository {
  mark: (input: { mark: SessionMark; session: string }) => string | undefined;
  // the blocks a reminder has named to the session, or to one of its agents
  reminded: (input: { agent: string | undefined; session: string }) => ReadonlySet<string>;
  state: (session: string) => SessionState | undefined;
}

export type { SessionQueryRepository };
