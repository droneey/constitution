import { describe, expect, it } from 'bun:test';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { requiresCheck } from '../requires';

const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';

describe('requiresCheck', () => {
  it('should report each requires a platform may not have when it names core, a language, an unknown id and itself', () => {
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
      kind: 'implementation',
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

  it.each<{
    block: BlockFixture;
    field: string;
  }>([
    {
      block: {
        body: '# i18n\n',
        id: 'i18n',
        kind: 'domain',
        requires: [
          'remote-data',
        ],
      },
      field: 'requires',
    },
    {
      block: {
        body: '# i18n\n',
        extends: 'remote-data',
        id: 'i18n',
        kind: 'domain',
      },
      field: 'extends',
    },
  ])(
    'should leave the field to the front-matter check when a domain fills $field',
    ({ block }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        'blocks/domains/i18n/i18n.md': mainFile(block),
      });

      // Act
      const findings = requiresCheck(input);

      // Assert
      expect(findings).toStrictEqual([]);
    },
  );

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
