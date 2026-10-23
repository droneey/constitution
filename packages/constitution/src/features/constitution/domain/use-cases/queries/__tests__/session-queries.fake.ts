import { SESSION, sessionStateOf } from '../../../../__tests__/session.fixtures';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { SessionMark, SessionState } from '../../../entities';

// What a session's store holds, read only: the states by session, session-1's alone by default,
// and the marks recorded and the blocks reminded of in session-1, the latter by the agent they were
// named to, none for the session itself, as the store on disk keeps them apart.
const createFakeSessionQueries = (
  held: {
    marks?: readonly {
      readonly mark: SessionMark;
      readonly value: string;
    }[];
    reminded?: readonly {
      readonly agent: string | undefined;
      readonly ids: readonly string[];
    }[];
    state?: SessionState;
    states?: Readonly<Record<string, SessionState>>;
  } = {},
): SessionQueryRepository => {
  const states = held.states ?? {
    [SESSION]: held.state ?? sessionStateOf(),
  };

  return {
    mark: (asked): string | undefined =>
      asked.session === SESSION
        ? held.marks?.find((recorded) => recorded.mark === asked.mark)?.value
        : undefined,
    reminded: (asked): ReadonlySet<string> =>
      new Set(
        (held.reminded ?? [])
          .filter((list) => asked.session === SESSION && list.agent === asked.agent)
          .flatMap((list) => list.ids),
      ),
    state: (session: string): SessionState | undefined => states[session],
  };
};

export { createFakeSessionQueries };
