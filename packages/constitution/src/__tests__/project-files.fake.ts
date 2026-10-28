import type { ProjectFiles } from '#/kernel/contracts';
import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

interface FakeTree {
  readonly files: Readonly<Record<string, string>>;
  readonly folders?: readonly string[];
  readonly links?: Readonly<Record<string, string>>;
  readonly unreadable?: readonly string[];
}

const resolvedOf = (input: { links: Readonly<Record<string, string>>; path: string }): string => {
  const found = Object.entries(input.links).find(
    ([link]) => input.path === link || input.path.startsWith(`${link}/`),
  );

  return found === undefined ? input.path : `${found[1]}${input.path.slice(found[0].length)}`;
};

const createFakeProjectFiles = (tree: FakeTree): ProjectFiles => {
  const links = tree.links ?? {};
  const unreadable = new Set(tree.unreadable ?? []);
  const paths = Object.keys(tree.files);

  const resolve = (path: string): string =>
    resolvedOf({
      links,
      path,
    });

  const isFile = (path: string): boolean => paths.includes(resolve(path));

  const isFolder = (path: string): boolean => {
    const real = resolve(path);

    return (
      real === '/' ||
      (tree.folders ?? []).includes(real) ||
      paths.some((file) => file.startsWith(`${real}/`))
    );
  };

  return {
    exists: (path: string): boolean => isFile(path) || isFolder(path) || paths.includes(path),
    isFile,
    isFolder,
    listFiles: (folder: string): readonly string[] | undefined => {
      const real = resolve(folder);

      return isFolder(folder)
        ? paths
            .filter((file) => file.startsWith(`${real}/`))
            .map((file) => file.slice(real.length + 1))
        : undefined;
    },
    read: (path: string): FileRead => {
      const real = resolve(path);
      const text = tree.files[real];

      if (unreadable.has(real)) {
        return {
          cause: new Error(`EACCES: permission denied, open '${real}'`),
          status: FileReadStatus.Unreadable,
        };
      }

      return text === undefined
        ? {
            status: FileReadStatus.Missing,
          }
        : {
            status: FileReadStatus.Read,
            text,
          };
    },
    realFolder: (folderPath: AbsolutePath): AbsolutePath | undefined =>
      isFolder(folderPath) ? AbsolutePath.create(resolve(folderPath)) : undefined,
  };
};

export type { FakeTree };
export { createFakeProjectFiles };
