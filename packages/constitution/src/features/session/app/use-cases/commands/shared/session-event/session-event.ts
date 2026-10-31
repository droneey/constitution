import type { SessionId } from '../../../../../domain/value-objects';
import { HookField, sessionEventSchema } from '../../../../constants';
import { hookEventOf } from '../../../../utils';

const sessionOfEvent = (text: string): SessionId | undefined =>
  hookEventOf({
    schema: sessionEventSchema,
    text,
  })[HookField.SessionId];

export { sessionOfEvent };
