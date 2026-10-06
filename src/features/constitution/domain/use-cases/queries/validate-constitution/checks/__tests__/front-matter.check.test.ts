import { describe, expect, it } from 'bun:test';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf, mainFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { frontMatterCheck } from '../front-matter.check';

const UI = 'blocks/domains/ui/ui.md';
const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';
const TYPESCRIPT = 'blocks/contexts/languages/typescript/typescript.md';

describe('frontMatterCheck', () => {
  it.each<{
    block: BlockFixture;
    expected: string;
    path: string;
  }>([
    {
      block: {
        body: '# UI\n',
        id: 'ux',
      },
      expected: 'declares the id "ux"; its folder names it "ui"',
      path: UI,
    },
    {
      block: {
        body: '# UI\n',
        id: 'ui',
        requires: [
          'i18n',
        ],
      },
      expected: 'sets "requires", which a domain block leaves empty',
      path: UI,
    },
    {
      block: {
        body: '# UI\n',
        extends: 'i18n',
        id: 'ui',
      },
      expected: 'sets "extends", which a domain block leaves empty',
      path: UI,
    },
    {
      block: {
        abstract: true,
        body: '# UI base\n',
        id: '_ui',
      },
      expected: 'sets "abstract", which a domain block leaves empty',
      path: 'blocks/domains/_ui/_ui.md',
    },
    {
      block: {
        body: '# TypeScript\n',
        id: 'typescript',
        languages: [
          'typescript',
        ],
      },
      expected: 'sets "languages", which a language block leaves empty',
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
      expected: 'sets "languages", which a platform block leaves empty',
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
      expected: 'languages lists ui, which is not a language block',
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
      expected: 'languages lists kotlin, which is not a language block',
      path: BIOME,
    },
    {
      block: {
        body: '# UI\n',
        id: 'ui',
        dictionary: [
          'Screen',
        ],
      },
      expected: 'sets "dictionary", which a domain block leaves empty',
      path: UI,
    },
    {
      block: {
        abstract: false,
        body: '# React\n',
        id: '_react',
      },
      expected: 'has an id starting with "_", so it is abstract',
      path: 'blocks/implementations/_react/_react.md',
    },
    {
      block: {
        abstract: true,
        body: '# Biome\n',
        id: 'biome',
      },
      expected: 'is abstract, so its id starts with "_"',
      path: BIOME,
    },
  ])(
    'should report "$expected" when a block breaks a rule of its front matter',
    ({ block, expected, path }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        [path]: mainFile(block),
      });

      // Act
      const findings = frontMatterCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path,
        },
      ]);
    },
  );
});
