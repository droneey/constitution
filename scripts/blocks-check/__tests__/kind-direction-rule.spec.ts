import { describe, expect, it } from 'bun:test';

import { kindDirectionRule } from '../rules/kind-direction.rule';
import { loadFiles, validFiles, yamlOf } from './fixtures';

describe('kindDirectionRule', () => {
  it('should accept dependencies on the same kind or a kind above', () => {
    // Act
    const findings = kindDirectionRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a concern that depends on a sphere', () => {
    // Arrange
    const files = validFiles();
    files['blocks/concerns/ui/block.yml'] = yamlOf({
      chapters: {
        ui: 'ui.md',
      },
      kind: 'concern',
      name: 'ui',
      refines: [
        'spheres/client',
      ],
      requires: [
        'spheres/client',
      ],
      summary: 'Leans on the anatomy.',
    });

    // Act
    const findings = kindDirectionRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'requires "spheres/client", a sphere block, but a concern block depends only on its own kind or a kind above it',
        path: 'blocks/concerns/ui/block.yml',
      },
      {
        message:
          'refines "spheres/client", a sphere block, but a concern block depends only on its own kind or a kind above it',
        path: 'blocks/concerns/ui/block.yml',
      },
    ]);
  });
});
