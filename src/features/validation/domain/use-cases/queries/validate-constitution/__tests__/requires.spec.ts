import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { requiresCheck } from '../checks/requires';

describe('requiresCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = requiresCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a requires that is core, unknown, sideways or itself', () => {
    // Arrange
    const files = validFiles();
    files['blocks/contexts/platforms/browser/browser.md'] = mainFile({
      body: '# Browser\n',
      id: 'browser',
      kind: 'context',
      requires: [
        'core',
        'typescript',
        'webgl',
        'browser',
      ],
    });

    // Act
    const findings = requiresCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'requires core, which is always active',
      'requires typescript, a language block; a platform block requires only domain blocks',
      'requires webgl, which is not a block',
      'requires itself',
    ]);
  });

  it('should report an implementation that requires core', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/biome/biome.md'] = mainFile({
      body: '# Biome\n',
      id: 'biome',
      kind: 'implementation',
      requires: [
        'core',
      ],
    });

    // Act
    const findings = requiresCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'requires core, which is always active',
        path: 'blocks/implementations/biome/biome.md',
      },
    ]);
  });

  it('should report an extends that is unknown, itself or not an implementation', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/biome/biome.md'] = mainFile({
      body: '# Biome\n',
      extends: 'eslint',
      id: 'biome',
      kind: 'implementation',
    });
    files['blocks/implementations/lingui/lingui.md'] = mainFile({
      body: '# Lingui\n',
      extends: 'lingui',
      id: 'lingui',
      kind: 'implementation',
    });
    files['blocks/implementations/react-dom/react-dom.md'] = mainFile({
      body: '# React DOM\n',
      extends: 'ui',
      id: 'react-dom',
      kind: 'implementation',
    });

    // Act
    const findings = requiresCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'extends eslint, which is not a block',
      'extends itself',
      'extends ui, a domain block; a block extends only an implementation',
    ]);
  });
});
