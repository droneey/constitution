import { compareText } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';

import type { FileTree } from '../domain/contracts';
import { TreeError, TreeFailure } from '../domain/errors';
import { TreePath } from '../domain/value-objects';

const root = AbsolutePath.create('/');

const createFakeFileTree = (files: Readonly<Record<string, string>>): FileTree => ({
  list: (): readonly TreePath[] => Object.keys(files).map(TreePath.create).toSorted(compareText),
  read: (path: TreePath): string => {
    const text = files[path];

    if (text === undefined) {
      throw new TreeError({
        code: TreeFailure.Unreadable,
        details: {
          path: AbsolutePath.join(root, path),
        },
      });
    }

    return text;
  },
});

export { createFakeFileTree };
