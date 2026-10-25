import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, passportFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { FrontMatterField } from '../../../../../entities';
import type { FrontMatterDetails } from '../front-matter';
import { FrontMatterCode, frontMatterCheck } from '../front-matter';

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
      {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: FrontMatterField.Abstract,
          layer: Layer.Core,
        },
        path: CORE,
      },
      {
        code: FrontMatterCode.AbstractWithoutUnderscore,
        details: {},
        path: CORE,
      },
    ]);
  });

  it.each<{
    block: BlockFixture;
    finding: FindingOf<FrontMatterDetails>;
  }>([
    {
      block: {
        body: '# UI\n',
        id: 'ux',
      },
      finding: {
        code: FrontMatterCode.IdMismatch,
        details: {
          declared: BlockId.create('ux'),
          folder: BlockId.create('ui'),
        },
        path: UI,
      },
    },
    {
      block: {
        body: '# Core\n',
        id: 'core',
        requires: [
          'i18n',
        ],
      },
      finding: {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: FrontMatterField.Requires,
          layer: Layer.Core,
        },
        path: CORE,
      },
    },
    {
      block: {
        body: '# Core\n',
        extends: 'i18n',
        id: 'core',
      },
      finding: {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: FrontMatterField.Extends,
          layer: Layer.Core,
        },
        path: CORE,
      },
    },
    {
      block: {
        body: '# TypeScript\n',
        id: 'typescript',
        languages: [
          'typescript',
        ],
      },
      finding: {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: FrontMatterField.Languages,
          layer: Layer.Language,
        },
        path: TYPESCRIPT,
      },
    },
    {
      block: {
        body: '# Browser\n',
        id: 'browser',
        languages: [
          'typescript',
        ],
      },
      finding: {
        code: FrontMatterCode.FieldOutsideLayer,
        details: {
          field: FrontMatterField.Languages,
          layer: Layer.Platform,
        },
        path: BROWSER,
      },
    },
    {
      block: {
        body: '# Biome\n',
        id: 'biome',
        languages: [
          'ui',
        ],
      },
      finding: {
        code: FrontMatterCode.NotLanguage,
        details: {
          listed: BlockId.create('ui'),
        },
        path: BIOME,
      },
    },
    {
      block: {
        body: '# Biome\n',
        id: 'biome',
        languages: [
          'kotlin',
        ],
      },
      finding: {
        code: FrontMatterCode.NotLanguage,
        details: {
          listed: BlockId.create('kotlin'),
        },
        path: BIOME,
      },
    },
    {
      block: {
        abstract: false,
        body: '# React\n',
        id: '_react',
      },
      finding: {
        code: FrontMatterCode.UnderscoreNotAbstract,
        details: {},
        path: 'blocks/implementations/_react/_react.md',
      },
    },
    {
      block: {
        abstract: true,
        body: '# Biome\n',
        id: 'biome',
      },
      finding: {
        code: FrontMatterCode.AbstractWithoutUnderscore,
        details: {},
        path: BIOME,
      },
    },
  ])(
    'should report $finding.code when a block breaks a rule of its front matter',
    ({ block, finding }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        [finding.path]: passportFile(block),
      });

      // Act
      const findings = frontMatterCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        finding,
      ]);
    },
  );
});
