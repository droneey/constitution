import type { StateFolderWarning } from '#/features/session/adapters/session-store';
import { StateFolderProblem } from '#/features/session/adapters/session-store';

import { hookPrefix } from './hook.constants';

const problemText = (warning: StateFolderWarning): string => {
  switch (warning.code) {
    case StateFolderProblem.Unnamed:
      return 'neither XDG_STATE_HOME nor HOME names a folder for the session — set HOME';
    case StateFolderProblem.Unsafe:
      return `${warning.folder} is a link, no folder, or another user's — remove it`;
    case StateFolderProblem.Unwritable:
      return `cannot make ${warning.folder} — make the folder above it writable`;
    // Stryker disable next-line ConditionalExpression: no problem reaches the default, which only the compiler reads
    default:
      return warning satisfies never;
  }
};

/**
 * The line a hook writes when no folder keeps the session: the problem, what to do, and what the
 * session goes without.
 */
const stateFolderWarningText = (warning: StateFolderWarning): string =>
  `${hookPrefix}: ${problemText(warning)}; this session keeps no reminders and no gate\n`;

export { stateFolderWarningText };
