import type { StateFolderWarning } from '#/features/session/adapters/session-store';
import { StateFolderProblem } from '#/features/session/adapters/session-store';

const HOOK = 'constitution hook';

/**
 * The line a hook writes when no folder keeps the session: the problem, what to do, and what the
 * session goes without.
 */
const stateFolderWarningText = (warning: StateFolderWarning): string => {
  // Stryker disable next-line StringLiteral: only the warning that names no folder leaves it out, and its line names none
  const folder = warning.folder ?? '';
  const problems: Readonly<Record<StateFolderProblem, string>> = {
    [StateFolderProblem.Unnamed]:
      'neither XDG_STATE_HOME nor HOME names a folder for the session — set HOME',
    [StateFolderProblem.Unsafe]: `${folder} is a link, no folder, or another user's — remove it`,
    [StateFolderProblem.Unwritable]: `cannot make ${folder} — make the folder above it writable`,
  };

  return `${HOOK}: ${problems[warning.code]}; this session keeps no reminders and no gate\n`;
};

export { stateFolderWarningText };
