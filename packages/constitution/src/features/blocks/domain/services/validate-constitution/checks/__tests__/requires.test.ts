import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { BlockFixture } from '../../../../../__tests__/constitution.fixtures';
import { passportFile } from '../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { RequiresDetails } from '../requires';
import { RequiresCode, requiresCheck } from '../requires';

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
      {
        code: RequiresCode.RequiresCore,
        details: {},
        path: BROWSER,
      },
      {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
            Layer.Platform,
          ],
          layer: Layer.Platform,
          required: BlockId.create('typescript'),
          requiredLayer: Layer.Language,
        },
        path: BROWSER,
      },
      {
        code: RequiresCode.RequiresNoBlock,
        details: {
          required: BlockId.create('webgl'),
        },
        path: BROWSER,
      },
      {
        code: RequiresCode.RequiresItself,
        details: {},
        path: BROWSER,
      },
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
      {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
          ],
          layer: Layer.Domain,
          required: BlockId.create('browser'),
          requiredLayer: Layer.Platform,
        },
        path: 'blocks/domains/i18n/i18n.md',
      },
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
    finding: FindingOf<RequiresDetails>;
  }>([
    {
      base: 'eslint',
      finding: {
        code: RequiresCode.ExtendsNoBlock,
        details: {
          base: BlockId.create('eslint'),
        },
        path: BIOME,
      },
    },
    {
      base: 'biome',
      finding: {
        code: RequiresCode.ExtendsItself,
        details: {},
        path: BIOME,
      },
    },
    {
      base: 'ui',
      finding: {
        code: RequiresCode.ExtendsOtherLayer,
        details: {
          base: BlockId.create('ui'),
          baseLayer: Layer.Domain,
        },
        path: BIOME,
      },
    },
    {
      base: 'lingui',
      finding: {
        code: RequiresCode.ExtendsConcrete,
        details: {
          base: BlockId.create('lingui'),
        },
        path: BIOME,
      },
    },
  ])('should report $finding.code when an implementation extends $base', ({ base, finding }) => {
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
      finding,
    ]);
  });
});
