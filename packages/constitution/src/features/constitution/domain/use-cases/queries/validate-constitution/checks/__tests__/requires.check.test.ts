import { describe, expect, it } from 'bun:test';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  findingOf,
  passportFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { requiresCheck } from '../requires.check';

const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';

describe('requiresCheck', () => {
  it('should report each requires a platform may not have when it names core, a language, an unknown id and itself', () => {
    // Arrange
    const files = validFiles();
    files[BROWSER] = passportFile({
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
      findingOf({
        code: 'requires-core',
        path: BROWSER,
      }),
      findingOf({
        code: 'requires-out-of-layer',
        names: [
          'typescript',
        ],
        path: BROWSER,
      }),
      findingOf({
        code: 'requires-no-block',
        names: [
          'webgl',
        ],
        path: BROWSER,
      }),
      findingOf({
        code: 'requires-itself',
        path: BROWSER,
      }),
    ]);
  });

  it('should accept an implementation when it requires another implementation', () => {
    // Arrange
    const files = validFiles();
    files[BIOME] = passportFile({
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
      'blocks/domains/i18n/i18n.md': passportFile({
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
      findingOf({
        code: 'requires-out-of-layer',
        names: [
          'browser',
        ],
        path: 'blocks/domains/i18n/i18n.md',
      }),
    ]);
  });

  it('should leave the requires of core to the front-matter check', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      'blocks/core/core.md': passportFile({
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
      'blocks/domains/i18n/i18n.md': passportFile({
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

  it.each<{
    base: string;
    code: string;
    names: string[];
  }>([
    {
      base: 'eslint',
      code: 'extends-no-block',
      names: [
        'eslint',
      ],
    },
    {
      base: 'biome',
      code: 'extends-itself',
      names: [],
    },
    {
      base: 'ui',
      code: 'extends-other-layer',
      names: [
        'ui',
      ],
    },
    {
      base: 'lingui',
      code: 'extends-concrete-block',
      names: [
        'lingui',
      ],
    },
  ])('should report $code when an implementation extends $base', ({ base, code, names }) => {
    // Arrange
    const files = validFiles();
    files[BIOME] = passportFile({
      body: '# Biome\n',
      extends: base,
      id: 'biome',
    });
    const input = checkInputOf(files);

    // Act
    const findings = requiresCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code,
        names,
        path: BIOME,
      }),
    ]);
  });
});
