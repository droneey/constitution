import { describe, expect, it } from 'bun:test';

import { checkInputOf, mainFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { requiresCheck } from '../requires.check';

const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';
const I18N = 'blocks/domains/i18n/i18n.md';

describe('requiresCheck', () => {
  it('should report each requires a platform may not have when it names core, a language, an unknown id and itself', () => {
    // Arrange
    const files = validFiles();
    files[BROWSER] = mainFile({
      body: '# Browser\n',
      id: 'browser',
      requires: [
        'core',
        'typescript',
        'webgl',
        'browser',
      ],
    });
    const input = checkInputOf(files);

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'requires core, which is always active',
        path: BROWSER,
      },
      {
        message:
          'requires typescript, a language block; a platform block requires only domain blocks',
        path: BROWSER,
      },
      {
        message: 'requires webgl, which is not a block',
        path: BROWSER,
      },
      {
        message: 'requires itself',
        path: BROWSER,
      },
    ]);
  });

  it('should accept an implementation when it requires another implementation', () => {
    // Arrange
    const files = validFiles();
    files[BIOME] = mainFile({
      body: '# Biome\n',
      id: 'biome',
      requires: [
        'typescript',
        'lingui',
      ],
    });
    const input = checkInputOf(files);

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should accept a domain when it requires another domain', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      [I18N]: mainFile({
        body: '# i18n\n',
        id: 'i18n',
        requires: [
          'remote-data',
        ],
      }),
    });

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a domain when it requires a platform', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      [I18N]: mainFile({
        body: '# i18n\n',
        id: 'i18n',
        requires: [
          'browser',
        ],
      }),
    });

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'requires browser, a platform block; a domain block requires only domain blocks',
        path: I18N,
      },
    ]);
  });

  it('should report a platform when it requires another platform', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      'blocks/contexts/platforms/cli/cli.md': mainFile({
        body: '# CLI\n',
        id: 'cli',
      }),
      [BROWSER]: mainFile({
        body: '# Browser\n',
        id: 'browser',
        requires: [
          'cli',
        ],
      }),
    });

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'requires cli, a platform block; a platform block requires only domain blocks',
        path: BROWSER,
      },
    ]);
  });

  it('should leave the field to the front-matter check when a domain fills extends', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      [I18N]: mainFile({
        body: '# i18n\n',
        extends: 'remote-data',
        id: 'i18n',
      }),
    });

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      base: 'eslint',
      expected: 'extends eslint, which is not a block',
    },
    {
      base: 'biome',
      expected: 'extends itself',
    },
    {
      base: 'ui',
      expected: 'extends ui, a domain block; a block extends only an implementation',
    },
  ])('should report "$expected" when an implementation extends $base', ({ base, expected }) => {
    // Arrange
    const files = validFiles();
    files[BIOME] = mainFile({
      body: '# Biome\n',
      extends: base,
      id: 'biome',
    });
    const input = checkInputOf(files);

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: expected,
        path: BIOME,
      },
    ]);
  });
});
