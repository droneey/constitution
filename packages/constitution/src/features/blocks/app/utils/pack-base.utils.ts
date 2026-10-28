import type { AbsolutePath } from '#/kernel/value-objects';
import { folderPathOf } from '#/shared/cli';

import type { PackBase } from '../../domain/use-cases/queries/check';

interface PackBaseInput {
  readonly base: string | undefined;
  readonly folderPath: AbsolutePath;
}

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
