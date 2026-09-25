import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { frontMatterCheck } from '../checks/front-matter';

describe('frontMatterCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = frontMatterCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report an id that is not the folder and a kind that is not the layer', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/i18n/i18n.md'] = mainFile({
      body: '# i18n\n',
      id: 'l10n',
      kind: 'context',
    });

    // Act
    const findings = frontMatterCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'declares the id "l10n"; its folder names it "i18n"',
        path: 'blocks/domains/i18n/i18n.md',
      },
      {
        message:
          'declares the kind "context"; its folder makes it a domain block',
        path: 'blocks/domains/i18n/i18n.md',
      },
    ]);
  });

  it('should report the fields a domain leaves empty', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/i18n/i18n.md'] = mainFile({
      body: '# i18n\n',
      checks: [
        'lint',
      ],
      extends: 'ui',
      id: 'i18n',
      kind: 'domain',
      owns: [
        'ICU',
      ],
      requires: [
        'ui',
      ],
    });

    // Act
    const findings = frontMatterCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'sets "requires", which a domain block leaves empty',
      'sets "extends", which a domain block leaves empty',
      'sets "checks", which a domain block leaves empty',
      'sets "owns", which a domain block leaves empty',
    ]);
  });

  it('should tie the underscore to abstract and keep constitution blocks stable', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/biome/biome.md'] = mainFile({
      abstract: true,
      body: '# Biome\n',
      id: 'biome',
      kind: 'implementation',
      status: 'draft',
    });
    files['blocks/implementations/_react/_react.md'] = mainFile({
      body: '# React\n',
      id: '_react',
      kind: 'implementation',
    });

    // Act
    const findings = frontMatterCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'has an id starting with "_", so it is abstract',
      'is abstract, so its id starts with "_"',
      'is draft; a block of the constitution is stable',
    ]);
  });
});
