import { existsSync } from 'node:fs';
import { join } from 'node:path';

const REPOSITORY = join(import.meta.dir, '..', '..');
const ENVIRONMENT = join(REPOSITORY, '.venv');

// mise's install runs `uv sync --locked`, which puts the dev group of
// pyproject.toml, pinned by uv.lock, into the repository's .venv.
const uvBinary = (tool: string): string => {
  const binary = join(ENVIRONMENT, 'bin', tool);

  if (!existsSync(binary)) {
    throw new Error(
      `${tool} is not installed: run \`mise install\` in a trusted checkout`,
    );
  }

  return binary;
};

export { ENVIRONMENT, uvBinary };
