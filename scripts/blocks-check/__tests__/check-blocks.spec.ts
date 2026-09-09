import { describe, expect, it } from 'bun:test';

import { checkBlocks } from '../check-blocks';
import { createFakeFileTree } from './fake-file-tree';
import { validFiles, without } from './fixtures';

describe('checkBlocks', () => {
  it('should find nothing in a sound tree', () => {
    // Act
    const findings = checkBlocks(createFakeFileTree(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should merge the loader and rule findings sorted by path, then message', () => {
    // Arrange
    const files = without(validFiles(), 'DECISIONS.md');
    files['blocks/spheres/web/block.yml'] = 'kind: [unclosed';
    files['blocks/concerns/ui/ui.md'] =
      `UI without a title\n${'line\n'.repeat(500)}`;

    // Act
    const findings = checkBlocks(createFakeFileTree(files));

    // Assert
    expect(findings.map((finding) => finding.path)).toStrictEqual([
      'DECISIONS.md',
      'assemblies/web-vite.yml',
      'blocks/concerns/ui/ui.md',
      'blocks/concerns/ui/ui.md',
      'blocks/spheres/web/block.yml',
      'blocks/stacks/vite/block.yml',
    ]);
    expect(findings[1]?.message).toBe('lists an unknown block "spheres/web"');
    expect(findings[2]?.message).toBe('does not open with a level-one heading');
    expect(findings[3]?.message).toStartWith('has 501 lines');
    expect(findings[5]?.message).toBe(
      'requires an unknown block "spheres/web"',
    );
  });
});
