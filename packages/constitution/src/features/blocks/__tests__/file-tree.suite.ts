import { describe, expect, it } from 'bun:test';

import type { FileTree } from '../application/contracts';
import { isTreeError, TreeFailure } from '../domain/errors';
import { TreePath } from '../domain/value-objects';

interface FileTreeSuiteInput {
  readonly name: string;
  readonly treeOf: (files: Readonly<Record<string, string>>) => FileTree;
}

const failureCodeOf = (act: () => unknown): unknown => {
  try {
    act();
  } catch (error) {
    if (isTreeError(error)) {
      return error.code;
    }

    throw error;
  }

  return undefined;
};

const runFileTreeSuite = (input: FileTreeSuiteInput): void => {
  describe(`${input.name}: the FileTree contract`, () => {
    it('should list every file it holds in order when they were added out of order', () => {
      // Arrange
      const tree = input.treeOf({
        'blocks/domains/ui/ui.md': '# UI\n',
        'blocks/core/core.md': '# Core\n',
      });

      // Act
      const listed = tree.list();

      // Assert
      expect<readonly string[]>(listed).toStrictEqual([
        'blocks/core/core.md',
        'blocks/domains/ui/ui.md',
      ]);
    });

    it('should read the text of a file it lists', () => {
      // Arrange
      const tree = input.treeOf({
        'blocks/core/core.md': '# Core\n',
      });

      // Act
      const text = tree.read(TreePath.create('blocks/core/core.md'));

      // Assert
      expect(text).toBe('# Core\n');
    });

    it('should fail as unreadable when it holds no file at the path', () => {
      // Arrange
      const tree = input.treeOf({
        'blocks/core/core.md': '# Core\n',
      });

      // Act
      const code = failureCodeOf(() => tree.read(TreePath.create('blocks/core/gone.md')));

      // Assert
      expect(code).toBe(TreeFailure.Unreadable);
    });
  });
};

export { runFileTreeSuite };
