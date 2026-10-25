import { describe, expect, it } from 'bun:test';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  findingOf,
  passportFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { frontMatterCheck } from '../front-matter';

const UI = 'blocks/domains/ui/ui.md';
const CORE = 'blocks/core/core.md';
const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';
const TYPESCRIPT = 'blocks/contexts/languages/typescript/typescript.md';

describe('frontMatterCheck', () => {
  it('should report an abstract core, which no block may build on', () => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      [CORE]: passportFile({
        abstract: true,
        body: '# Core\n',
        id: 'core',
      }),
    });

    // Act
    const findings = frontMatterCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'field-outside-layer',
        names: [
          'abstract',
          'core',
        ],
        path: CORE,
      }),
      findingOf({
        code: 'abstract-id-without-underscore',
        path: CORE,
      }),
    ]);
  });

  it.each<{
    block: BlockFixture;
    code: string;
    names?: readonly string[];
    path: string;
  }>([
    {
      block: {
        body: '# UI\n',
        id: 'ux',
      },
      code: 'id-mismatches-folder',
      names: [
        'ux',
        'ui',
      ],
      path: UI,
    },
    {
      block: {
        body: '# Core\n',
        id: 'core',
        requires: [
          'i18n',
        ],
      },
      code: 'field-outside-layer',
      names: [
        'requires',
        'core',
      ],
      path: CORE,
    },
    {
      block: {
        body: '# Core\n',
        extends: 'i18n',
        id: 'core',
      },
      code: 'field-outside-layer',
      names: [
        'extends',
        'core',
      ],
      path: CORE,
    },
    {
      block: {
        body: '# TypeScript\n',
        id: 'typescript',
        languages: [
          'typescript',
        ],
      },
      code: 'field-outside-layer',
      names: [
        'languages',
        'language',
      ],
      path: TYPESCRIPT,
    },
    {
      block: {
        body: '# Browser\n',
        id: 'browser',
        languages: [
          'typescript',
        ],
      },
      code: 'field-outside-layer',
      names: [
        'languages',
        'platform',
      ],
      path: BROWSER,
    },
    {
      block: {
        body: '# Biome\n',
        id: 'biome',
        languages: [
          'ui',
        ],
      },
      code: 'languages-names-no-language',
      names: [
        'ui',
      ],
      path: BIOME,
    },
    {
      block: {
        body: '# Biome\n',
        id: 'biome',
        languages: [
          'kotlin',
        ],
      },
      code: 'languages-names-no-language',
      names: [
        'kotlin',
      ],
      path: BIOME,
    },
    {
      block: {
        abstract: false,
        body: '# React\n',
        id: '_react',
      },
      code: 'underscore-id-not-abstract',
      path: 'blocks/implementations/_react/_react.md',
    },
    {
      block: {
        abstract: true,
        body: '# Biome\n',
        id: 'biome',
      },
      code: 'abstract-id-without-underscore',
      path: BIOME,
    },
  ])(
    'should report $code when a block breaks a rule of its front matter',
    ({ block, path, ...finding }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        [path]: passportFile(block),
      });

      // Act
      const findings = frontMatterCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          ...finding,
          path,
        }),
      ]);
    },
  );
});
