import { describe, expect, it } from 'bun:test';

import { loadConstitution } from '../load-constitution';
import { createFakeFileTree } from './fake-file-tree';
import { validFiles, without, yamlOf } from './fixtures';

describe('loadConstitution', () => {
  it('should load every block, assembly and root document of a sound tree', () => {
    // Arrange
    const tree = createFakeFileTree(validFiles());

    // Act
    const { constitution, findings } = loadConstitution(tree);

    // Assert
    expect(findings).toStrictEqual([]);
    expect(constitution.blocks.map((block) => block.id)).toStrictEqual([
      'concerns/ui',
      'core',
      'languages/typescript',
      'spheres/client',
      'spheres/web',
      'stacks/vite',
    ]);
    expect(
      constitution.assemblies.map((assembly) => assembly.fileName),
    ).toStrictEqual([
      'web-vite',
    ]);
    expect(constitution.decisions).toStartWith('# Decisions');
    expect(constitution.readme).toStartWith('# constitution');
  });

  it('should derive the kind and the folder name from the path', () => {
    // Arrange
    const tree = createFakeFileTree(validFiles());

    // Act
    const { constitution } = loadConstitution(tree);
    const web = constitution.blocks.find((block) => block.id === 'spheres/web');

    // Assert
    expect(web?.kind).toBe('sphere');
    expect(web?.dir).toBe('blocks/spheres/web');
    expect(web?.chapters.map((chapter) => chapter.axis)).toStrictEqual([
      'architecture',
    ]);
  });

  it('should report a manifest that is not valid YAML', () => {
    // Arrange
    const files = validFiles();
    files['blocks/concerns/ui/block.yml'] = 'kind: [unclosed';

    // Act
    const { constitution, findings } = loadConstitution(
      createFakeFileTree(files),
    );

    // Assert
    expect(findings).toHaveLength(1);
    expect(findings[0]?.path).toBe('blocks/concerns/ui/block.yml');
    expect(findings[0]?.message).toStartWith('is not valid YAML');
    expect(constitution.blocks.map((block) => block.id)).not.toContain(
      'concerns/ui',
    );
  });

  it('should report a manifest that misses a field or carries an unknown one', () => {
    // Arrange
    const files = validFiles();
    files['blocks/concerns/ui/block.yml'] = yamlOf({
      chapters: {
        ui: 'ui.md',
      },
      kind: 'concern',
      name: 'ui',
      owner: 'nobody',
    });

    // Act
    const { findings } = loadConstitution(createFakeFileTree(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: expect.stringContaining('does not match the manifest schema'),
        path: 'blocks/concerns/ui/block.yml',
      },
    ]);
    expect(findings[0]?.message).toContain('summary');
    expect(findings[0]?.message).toContain('owner');
  });

  it('should report a block under a folder that is not a kind', () => {
    // Arrange
    const files = validFiles();
    files['blocks/tools/lint/block.yml'] = yamlOf({
      chapters: {},
      kind: 'stack',
      name: 'lint',
      summary: 'Nowhere.',
    });

    // Act
    const { findings } = loadConstitution(createFakeFileTree(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'sits under "tools", which is not a kind of block',
        path: 'blocks/tools/lint/block.yml',
      },
    ]);
  });

  it('should skip a chapter whose file is missing and leave the manifest rule to report it', () => {
    // Arrange
    const files = without(validFiles(), 'blocks/concerns/ui/ui.md');

    // Act
    const { constitution, findings } = loadConstitution(
      createFakeFileTree(files),
    );
    const ui = constitution.blocks.find((block) => block.id === 'concerns/ui');

    // Assert
    expect(findings).toStrictEqual([]);
    expect(ui?.chapters).toStrictEqual([]);
  });

  it('should report an assembly that does not match the schema', () => {
    // Arrange
    const files = validFiles();
    files['assemblies/web-vite.yml'] = yamlOf({
      name: 'web-vite',
      sphere: 'web',
    });

    // Act
    const { constitution, findings } = loadConstitution(
      createFakeFileTree(files),
    );

    // Assert
    expect(constitution.assemblies).toStrictEqual([]);
    expect(findings).toStrictEqual([
      {
        message: expect.stringContaining('blocks'),
        path: 'assemblies/web-vite.yml',
      },
    ]);
  });

  it('should leave the root documents undefined when they are absent', () => {
    // Arrange
    const files = without(validFiles(), 'DECISIONS.md', 'README.md');

    // Act
    const { constitution } = loadConstitution(createFakeFileTree(files));

    // Assert
    expect(constitution.decisions).toBeUndefined();
    expect(constitution.readme).toBeUndefined();
  });
});
