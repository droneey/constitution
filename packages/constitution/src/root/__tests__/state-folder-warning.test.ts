import { describe, expect, it } from 'bun:test';

import { StateFolderProblem } from '#/features/session/adapters/session-store';

import { stateFolderWarningText } from '../state-folder-warning';

describe('stateFolderWarningText', () => {
  it.each([
    {
      line: 'constitution hook: neither XDG_STATE_HOME nor HOME names a folder for the session — set HOME; this session keeps no reminders and no gate\n',
      warning: {
        code: StateFolderProblem.Unnamed,
      },
    },
    {
      line: "constitution hook: /home/a/.local/state/droneey-constitution is a link, no folder, or another user's — remove it; this session keeps no reminders and no gate\n",
      warning: {
        code: StateFolderProblem.Unsafe,
        folder: '/home/a/.local/state/droneey-constitution',
      },
    },
    {
      line: 'constitution hook: cannot make /home/a/.local/state/droneey-constitution/sessions — make the folder above it writable; this session keeps no reminders and no gate\n',
      warning: {
        code: StateFolderProblem.Unwritable,
        folder: '/home/a/.local/state/droneey-constitution/sessions',
      },
    },
  ])(
    'should write one line naming the problem and the folder when it is $warning.code',
    ({ line, warning }) => {
      // Act
      const text = stateFolderWarningText(warning);

      // Assert
      expect(text).toBe(line);
    },
  );
});
