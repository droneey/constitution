import { describe, expect, it } from 'bun:test';

import {
  createFakeFileTree,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { validateConstitution } from '../validate-constitution.use-case';

describe('validateConstitution', () => {
  it('should find nothing in the valid constitution', () => {
    // Act
    const findings = validateConstitution({
      tree: createFakeFileTree(validFiles()),
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should sort loader and check findings by path, then message', () => {
    // Arrange
    const files = validFiles();
    files['blocks/spheres/web/web.md'] = '# Web\n';
    files['blocks/domains/ui/.DS_Store'] = '';
    files['blocks/core/principles.md'] =
      '# Principles\n\nRun Biome with TypeScript.\n';

    // Act
    const findings = validateConstitution({
      tree: createFakeFileTree(files),
    });

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'names "Biome", which biome owns; only biome and the blocks that depend on it may',
        path: 'blocks/core/principles.md',
      },
      {
        message:
          'names "TypeScript", which typescript owns; only typescript and the blocks that depend on it may',
        path: 'blocks/core/principles.md',
      },
      {
        message:
          'is not a block file; a block holds its main file, its chapters and with/<block>.md',
        path: 'blocks/domains/ui/.DS_Store',
      },
      {
        message:
          'is not inside a layer folder: core, domains, contexts/platforms, contexts/languages or implementations',
        path: 'blocks/spheres/web/web.md',
      },
    ]);
  });
});
