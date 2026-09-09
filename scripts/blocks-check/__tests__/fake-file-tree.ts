import type { FileTree } from '../file-tree';

const createFakeFileTree = (
  files: Readonly<Record<string, string>>,
): FileTree => ({
  list: (): readonly string[] => Object.keys(files).toSorted(),
  read: (path: string): string => {
    const text = files[path];

    if (text === undefined) {
      throw new Error(`No such file: ${path}`);
    }

    return text;
  },
});

export { createFakeFileTree };
