import type { AbsolutePath } from '#/kernel/value-objects';
import { folderPathOf } from '#/shared/cli';

import type { PackBase } from '../../domain/use-cases/queries/check';

interface PackBaseInput {
  /** as the check was given it */
  readonly base: string | undefined;
  /** the folder the check runs in */
  readonly folderPath: AbsolutePath;
}

/** The base a check names, from the folder it runs in unless it opens with "/"; none when none is named. */
const packBaseOf = (input: PackBaseInput): PackBase | undefined =>
  input.base === undefined
    ? undefined
    : {
        folder: input.base,
        folderPath: folderPathOf({
          from: input.folderPath,
          given: input.base,
        }),
      };

export { packBaseOf };
