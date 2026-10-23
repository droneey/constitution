import type { ProjectWarning } from '../../../entities';
import { WarningCode } from '../../../entities';

interface WarningLog {
  add: (warning: ProjectWarning) => void;
  // grouped by code in the order WarningCode declares, each group in the order it was given
  list: () => readonly ProjectWarning[];
}

const CODES: readonly WarningCode[] = Object.values(WarningCode);

// A warning given twice is kept once, where it was first given.
const createWarningLog = (): WarningLog => {
  const given = new Map<string, ProjectWarning>();

  return {
    add: (warning: ProjectWarning): void => {
      given.set(`${warning.code}\n${warning.message}`, warning);
    },
    list: (): readonly ProjectWarning[] =>
      CODES.flatMap((code) =>
        [
          ...given.values(),
        ].filter((warning) => warning.code === code),
      ),
  };
};

export type { WarningLog };
export { createWarningLog };
