import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

interface FileTree {
  list: () => readonly string[];
  read: (path: string) => string;
}

const IGNORED_SEGMENTS: ReadonlySet<string> = new Set([
  '.git',
  'node_modules',
]);

const isListed = (path: string): boolean =>
  !path.split('/').some((segment) => IGNORED_SEGMENTS.has(segment));

const nodeFileTree = (root: string): FileTree => ({
  list: (): readonly string[] =>
    readdirSync(root, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) =>
        relative(root, join(entry.parentPath, entry.name)).split(sep).join('/'),
      )
      .filter(isListed)
      .toSorted(),
  read: (path: string): string => readFileSync(join(root, path), 'utf8'),
});

export type { FileTree };
export { nodeFileTree };
