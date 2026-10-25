import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// mise's install runs `uv sync --locked`, which puts the dev group of the
// workspace's pyproject.toml, pinned by uv.lock, into the .venv at the root of
// the repository.
const uvEnvironment = join(
  execFileSync(
    'git',
    [
      'rev-parse',
      '--show-toplevel',
    ],
    {
      cwd: import.meta.dir,
      encoding: 'utf8',
    },
  ).trim(),
  '.venv',
);

const uvBinary = (tool: string): string => {
  const binary = join(uvEnvironment, 'bin', tool);

  if (!existsSync(binary)) {
    throw new Error(`${tool} is not installed: run \`mise install\` in a trusted checkout`);
  }

  return binary;
};

export { uvBinary, uvEnvironment };
