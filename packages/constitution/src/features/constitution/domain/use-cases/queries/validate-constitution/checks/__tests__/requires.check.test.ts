import { describe, expect, it } from 'bun:test';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, mainFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { requiresCheck } from '../requires.check';

const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';

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
          'requires typescript, a language block; a platform block requires only domain blocks or platform blocks',
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

  it('should report a domain that requires a platform, a layer below it', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      'blocks/domains/i18n/i18n.md': mainFile({
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
        path: 'blocks/domains/i18n/i18n.md',
      },
    ]);
  });

  it('should leave the requires of core to the front-matter check', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      'blocks/core/core.md': mainFile({
        body: '# Core\n',
        id: 'core',
        requires: [
          'i18n',
        ],
      }),
    });

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should accept a domain when it requires the domain it builds on', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      'blocks/domains/i18n/i18n.md': mainFile({
        body: '# i18n\n',
        id: 'i18n',
        requires: [
          'remote-data',
        ],
      } satisfies BlockFixture),
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
      expected: 'extends ui, a domain block; a block extends only a base of its own layer',
    },
    {
      base: 'lingui',
      expected:
        'extends lingui, a concrete block; a block extends only an abstract base — require it instead',
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
