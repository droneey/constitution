import { miseBinary } from './mise.fixtures';
import { linesOf, pythonPackage, runTool, widestAppliedUnit } from './preset-load.fixtures';

interface Lock {
  readonly status: number;
  readonly warnings: readonly string[];
}

// uv only warns on a pyproject.toml it cannot read, and then leaves out all of [tool.uv].
const WARNING = /^warning:/;

const lockOf = async (reader: string): Promise<Lock> => {
  const run = await runTool({
    command: [
      miseBinary('uv'),
      'lock',
      '--offline',
    ],
    env: new Map([
      [
        'UV_CACHE_DIR',
        '.uv-cache',
      ],
    ]),
    folder: widestAppliedUnit(reader, {
      files: pythonPackage,
    }),
  });

  return {
    status: run.status,
    warnings: linesOf(run.stderr).filter((line) => WARNING.test(line)),
  };
};

export { lockOf };
