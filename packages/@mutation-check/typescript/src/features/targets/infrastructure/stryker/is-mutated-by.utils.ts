import { matchesGlob } from 'node:path';

import type { UnitRelativePath } from '#/kernel/value-objects';

// Why: Stryker's `mutate` reads a pattern that opens with `!` as one that leaves out what it
// matches.
const NEGATION = '!';

const isMutatedBy =
  (mutateGlobs: readonly string[]) =>
  (filePath: UnitRelativePath): boolean =>
    mutateGlobs.some((glob) => !glob.startsWith(NEGATION) && matchesGlob(filePath, glob)) &&
    !mutateGlobs.some(
      (glob) => glob.startsWith(NEGATION) && matchesGlob(filePath, glob.slice(NEGATION.length)),
    );

export { isMutatedBy };
