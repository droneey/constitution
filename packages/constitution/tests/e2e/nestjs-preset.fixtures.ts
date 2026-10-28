import { join } from 'node:path';

import { transformFileSync } from '@swc/core';

interface SourceInput {
  readonly file: string;
  readonly folder: string;
}

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
