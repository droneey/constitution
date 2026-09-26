import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { requiresCheck } from '../requires';

const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';

describe('requiresCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a requires that is core, a sibling layer, unknown or itself when a platform names them', () => {
    // Arrange
    const files = validFiles();
    files[BROWSER] = mainFile({
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
    const input = checkInputOf(files);

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'requires core, which is always active',
      'requires typescript, a language block; a platform block requires only domain blocks',
      'requires webgl, which is not a block',
      'requires itself',
    ]);
  });

  it('should leave a filled requires of a domain to the front-matter check when a domain requires a sibling', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/i18n/i18n.md'] = mainFile({
      body: '# i18n\n',
      id: 'i18n',
      kind: 'domain',
      requires: [
        'remote-data',
      ],
    });
    const input = checkInputOf(files);

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
      expected:
        'extends ui, a domain block; a block extends only an implementation',
    },
  ])(
    'should report "$expected" when an implementation extends $base',
    ({ base, expected }) => {
      // Arrange
      const files = validFiles();
      files[BIOME] = mainFile({
        body: '# Biome\n',
        extends: base,
        id: 'biome',
        kind: 'implementation',
        requires: [
          'typescript',
        ],
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
    },
  );
});
