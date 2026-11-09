import type { SessionId } from '../../../../domain/session/value-objects';
import type { SessionQueries } from '../../../contracts/repositories/queries';

interface IsSessionStartedInput {
  readonly session: SessionId;
  readonly sessionQueries: SessionQueries;
}

const isSessionStarted = (input: IsSessionStartedInput): boolean =>
  input.sessionQueries.state(input.session) !== undefined ||
  input.sessionQueries.isStarted(input.session);

export { isSessionStarted };
