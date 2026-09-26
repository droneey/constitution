import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { seamsCheck } from '../seams';

describe('seamsCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = seamsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      expected:
        'is named after react-dom, an implementation block; a domain block pairs only with domain blocks',
      path: 'blocks/domains/ui/with/react-dom.md',
    },
    {
      expected: 'is named after its own block',
      path: 'blocks/domains/ui/with/ui.md',
    },
    {
      expected: 'is named after core, which is not a block it may pair with',
      path: 'blocks/domains/ui/with/core.md',
    },
    {
      expected: 'is named after nowhere, which is not a block it may pair with',
      path: 'blocks/domains/ui/with/nowhere.md',
    },
    {
      expected: 'is a with/ file of core, which pairs with no block',
      path: 'blocks/core/with/ui.md',
    },
  ])(
    'should report "$expected" when $path pairs with a block it may not',
    ({ expected, path }) => {
      // Arrange
      const files = validFiles();
      files[path] = '# Seam\n';
      const input = checkInputOf(files);

      // Act
      const findings = seamsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path,
        },
      ]);
    },
  );

  it.each([
    'blocks/contexts/platforms/browser/with/typescript.md',
    'blocks/contexts/languages/typescript/with/browser.md',
    'blocks/contexts/platforms/browser/with/ui.md',
    'blocks/implementations/biome/with/lingui.md',
  ])(
    'should accept %p when it pairs with a block of its own layer or above',
    (path) => {
      // Arrange
      const files = validFiles();
      files[path] = '# Seam\n';
      const input = checkInputOf(files);

      // Act
      const findings = seamsCheck(input);

      // Assert
      expect(findings).toStrictEqual([]);
    },
  );

  it('should report a chapter named after a block when core lists it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/core.md'] = mainFile({
      body: '# Core\n',
      chapters: [
        'principles.md',
        'ui.md',
      ],
      id: 'core',
      kind: 'core',
    });
    files['blocks/core/ui.md'] = '# UI in core\n';
    const input = checkInputOf(files);

    // Act
    const findings = seamsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'takes the id of the block ui; a file named after a block belongs in with/',
        path: 'blocks/core/ui.md',
      },
    ]);
  });
});
