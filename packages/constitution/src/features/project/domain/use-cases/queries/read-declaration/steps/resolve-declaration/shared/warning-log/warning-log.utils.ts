import type { ProjectWarning } from '#/kernel/entities';
import { WarningCode } from '#/kernel/entities';

interface WarningLog {
  readonly add: (warning: ProjectWarning) => void;
  // grouped by code in the order WarningCode declares, each group in the order it was given
  readonly list: () => readonly ProjectWarning[];
}

const codes: readonly WarningCode[] = Object.values(WarningCode);

/** A warning given again, of the same code, kind and details, is kept once, where first given. */
const createWarningLog = (): WarningLog => {
  const given = new Map<string, ProjectWarning>();

  return {
    add: (warning: ProjectWarning): void => {
      given.set(`${warning.code}\n${warning.kind}\n${JSON.stringify(warning.details)}`, warning);
    },
    list: (): readonly ProjectWarning[] =>
      codes.flatMap((code) =>
        [
          ...given.values(),
        ].filter((warning) => warning.code === code),
      ),
  };
};

export type { WarningLog };
export { createWarningLog };
