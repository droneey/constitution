import { describe, expect, it } from 'bun:test';

import {
  createFakeFileTree,
  mainFile,
  validFiles,
  without,
} from '../../../../../__tests__/fixtures';
import { loadConstitution } from '../load-constitution.use-case';

const load = (files: Record<string, string>) =>
  loadConstitution({
    tree: createFakeFileTree(files),
  });

describe('loadConstitution', () => {
  it('should load every block of the valid constitution without findings', () => {
    // Act
    const { constitution, findings } = load(validFiles());

    // Assert
    expect(findings).toStrictEqual([]);
    expect(constitution.blocks.map((block) => block.id)).toStrictEqual([
      '_react',
      'biome',
      'browser',
      'core',
      'i18n',
      'lingui',
      'react-dom',
      'remote-data',
      'typescript',
      'ui',
      'untrusted-client',
    ]);
    expect(constitution.rules).toHaveLength(11);
    expect(constitution.requirementAnswers).toHaveLength(1);
    expect(constitution.documents.plugin).toContain('constitution');
  });

  it('should strip the main file of its front matter and keep chapters and with/ files in order', () => {
    // Act
    const { constitution } = load(validFiles());
    const core = constitution.blocks.find((block) => block.id === 'core');
    const ui = constitution.blocks.find((block) => block.id === 'ui');

    // Assert
    expect(
      [
        ...(core?.files ?? []),
        ...(ui?.files ?? []),
      ].map((file) => [
        file.role,
        file.with,
      ]),
    ).toStrictEqual([
      [
        'main',
        null,
      ],
      [
        'chapter',
        null,
      ],
      [
        'main',
        null,
      ],
      [
        'with',
        'remote-data',
      ],
    ]);
    expect(ui?.files[0]?.text.startsWith('---')).toBe(false);
  });

  it('should report a folder without its main file', () => {
    // Arrange
    const files = without(validFiles(), 'blocks/domains/i18n/i18n.md');
    files['blocks/domains/i18n/notes.md'] = '# Notes\n';

    // Act
    const { findings } = load(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'has no main file i18n.md',
        path: 'blocks/domains/i18n',
      },
    ]);
  });

  it('should report a stray file and a file outside every layer folder', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/ui/.DS_Store'] = '';
    files['blocks/spheres/web/web.md'] = '# Web\n';

    // Act
    const { findings } = load(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is not inside a layer folder: core, domains, contexts/platforms, contexts/languages or implementations',
        path: 'blocks/spheres/web/web.md',
      },
      {
        message:
          'is not a block file; a block holds its main file, its chapters and with/<block>.md',
        path: 'blocks/domains/ui/.DS_Store',
      },
    ]);
  });

  it('should report an unlisted chapter, a missing one and a chapter with front matter', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/core.md'] = mainFile({
      body: '# Core\n',
      chapters: [
        'principles.md',
        'testing.md',
      ],
      id: 'core',
      kind: 'core',
    });
    files['blocks/core/security.md'] = '# Security\n';
    files['blocks/core/principles.md'] = '---\nid: x\n---\n# Principles\n';

    // Act
    const { findings } = load(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'has front matter; only the main file of a block carries it',
        path: 'blocks/core/principles.md',
      },
      {
        message: 'is not listed in the chapters of core',
        path: 'blocks/core/security.md',
      },
      {
        message: 'lists the chapter testing.md, which does not exist',
        path: 'blocks/core/core.md',
      },
    ]);
  });

  it('should leave a block with an invalid front matter out of the model', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/i18n/i18n.md'] = '# i18n\n';

    // Act
    const { constitution, findings } = load(files);

    // Assert
    expect(findings).toHaveLength(1);
    expect(constitution.blocks.some((block) => block.id === 'i18n')).toBe(
      false,
    );
  });

  it('should leave the plugin documents undefined when they are absent', () => {
    // Act
    const { constitution } = load({});

    // Assert
    expect(constitution.documents).toStrictEqual({
      hooks: undefined,
      marketplace: undefined,
      plugin: undefined,
      readme: undefined,
    });
  });
});
