import { join } from 'node:path';

import { transformFileSync } from '@swc/core';

interface SourceInput {
  /** from the folder */
  readonly file: string;
  readonly folder: string;
}

/** What swc says against the .swcrc of the folder when it compiles one of its files: none where it loads. */
const swcRefusalsOf = (input: SourceInput): readonly string[] => {
  try {
    transformFileSync(join(input.folder, input.file), {
      cwd: input.folder,
      swcrc: true,
    });

    return [];
  } catch (error) {
    return [
      String(error),
    ];
  }
};

export { swcRefusalsOf };
