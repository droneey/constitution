import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import type { FileTree } from '../../domain/contracts/file-tree.port';

const IGNORED_SEGMENTS: ReadonlySet<string> = new Set([
  '.git',
  'node_modules',
]);
const IGNORED_NAMES: ReadonlySet<string> = new Set([
  '.DS_Store',
]);

const isListed = (path: string): boolean => {
  const segments = path.split('/');
  const name = segments.at(-1) ?? '';

  return !(
    segments.some((segment) => IGNORED_SEGMENTS.has(segment)) ||
    IGNORED_NAMES.has(name)
  );
};

const createNodeFileTree = (input: { root: string }): FileTree => ({
  list: (): readonly string[] =>
    readdirSync(input.root, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) =>
        relative(input.root, join(entry.parentPath, entry.name))
          .split(sep)
          .join('/'),
      )
      .filter(isListed)
      .toSorted(),
  read: (path: string): string => readFileSync(join(input.root, path), 'utf8'),
});

export { createNodeFileTree };
