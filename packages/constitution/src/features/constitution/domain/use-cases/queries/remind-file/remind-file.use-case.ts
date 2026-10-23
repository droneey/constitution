import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { Reminder } from '../../../entities';
import { governingOf, isPlainName } from '../../../utils';

const NOTE_BYTES = 300;
const ELLIPSIS = '...';
const DOT_SLASH = './';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// A note longer than its budget is cut, on a character's border, and ends with an ellipsis.
const fitted = (note: string): string => {
  const bytes = encoder.encode(note);

  if (bytes.length <= NOTE_BYTES) {
    return note;
  }

  return `${decoder.decode(bytes.slice(0, NOTE_BYTES - ELLIPSIS.length)).replace(/�$/u, '')}${ELLIPSIS}`;
};

/**
 * The blocks that govern a file the agent touched and that the session, or its agent, was not yet
 * reminded of; undefined when the session keeps no state or the file lies outside its project.
 */
const remindFile = (input: {
  agent: string;
  path: string;
  session: string;
  sessions: SessionQueryRepository;
}): Reminder | undefined => {
  const agent = input.agent === '' ? undefined : input.agent;
  const state = isPlainName(input.session) ? input.sessions.state(input.session) : undefined;

  if (
    state === undefined ||
    state.project === '' ||
    input.path === '' ||
    (input.agent !== '' && !isPlainName(input.agent))
  ) {
    return undefined;
  }

  const isOutside = input.path.startsWith('/') && !input.path.startsWith(`${state.project}/`);

  if (state.active.length === 0 || isOutside) {
    return undefined;
  }

  const relative = input.path.startsWith('/')
    ? input.path.slice(state.project.length + 1)
    : input.path;
  const path = relative.startsWith(DOT_SLASH) ? relative.slice(DOT_SLASH.length) : relative;
  const reminded = input.sessions.reminded({
    agent,
    session: input.session,
  });
  const blocks = governingOf({
    active: state.active,
    path,
  }).filter((block) => !reminded.has(block.id));

  return {
    ids: blocks.map((block) => block.id),
    notes: blocks.map((block) => {
      const musts = state.musts.filter((must) => must.block === block.id).map((must) => must.rule);

      return fitted(
        `${block.id} governs ${path}: read ${block.files.join(' ')}${musts.length === 0 ? '' : `; its MUST rules: ${musts.join(', ')}`}.`,
      );
    }),
  };
};

export { remindFile };
