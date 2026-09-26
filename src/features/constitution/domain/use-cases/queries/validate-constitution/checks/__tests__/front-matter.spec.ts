import { describe, expect, it } from 'bun:test';

import type {
  BlockFixture,
  Files,
} from '#/features/constitution/__tests__/fixtures';
import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { frontMatterCheck } from '../front-matter';

const withBlock = (input: { block: BlockFixture; path: string }): Files => ({
  ...validFiles(),
  [input.path]: mainFile(input.block),
});

describe('frontMatterCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = frontMatterCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      block: {
        body: '# UI\n',
        id: 'ux',
        kind: 'domain',
      },
      expected: 'declares the id "ux"; its folder names it "ui"',
      path: 'blocks/domains/ui/ui.md',
    },
    {
      block: {
        body: '# Browser\n',
        id: 'browser',
        kind: 'domain',
        requires: [
          'untrusted-client',
        ],
      },
      expected:
        'declares the kind "domain"; its folder makes it a platform block, of the kind "context"',
      path: 'blocks/contexts/platforms/browser/browser.md',
    },
    {
      block: {
        body: '# UI\n',
        id: 'ui',
        kind: 'domain',
        owns: [
          'Screen',
        ],
      },
      expected: 'sets "owns", which a domain block leaves empty',
      path: 'blocks/domains/ui/ui.md',
    },
    {
      block: {
        body: '# UI\n',
        id: 'ui',
        kind: 'domain',
        requires: [
          'i18n',
        ],
      },
      expected: 'sets "requires", which a domain block leaves empty',
      path: 'blocks/domains/ui/ui.md',
    },
    {
      block: {
        body: '# Browser\n',
        checks: [
          'lint',
        ],
        id: 'browser',
        kind: 'context',
        requires: [
          'untrusted-client',
        ],
      },
      expected: 'sets "checks", which a platform block leaves empty',
      path: 'blocks/contexts/platforms/browser/browser.md',
    },
    {
      block: {
        body: '# Biome\n',
        id: 'biome',
        kind: 'implementation',
        requires: [
          'typescript',
        ],
        status: 'draft',
      },
      expected: 'is draft; a block of the constitution is stable',
      path: 'blocks/implementations/biome/biome.md',
    },
  ])(
    'should report "$expected" when a block breaks the rule of its layer',
    ({ block, expected, path }) => {
      // Arrange
      const input = checkInputOf(
        withBlock({
          block,
          path,
        }),
      );

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

  it.each([
    {
      block: {
        abstract: false,
        body: '# React\n',
        id: '_react',
        kind: 'implementation',
        requires: [
          'ui',
        ],
      },
      expected: 'has an id starting with "_", so it is abstract',
      path: 'blocks/implementations/_react/_react.md',
    },
    {
      block: {
        abstract: true,
        body: '# Biome\n',
        id: 'biome',
        kind: 'implementation',
        requires: [
          'typescript',
        ],
      },
      expected: 'is abstract, so its id starts with "_"',
      path: 'blocks/implementations/biome/biome.md',
    },
  ])(
    'should report "$expected" when the id and the abstract flag disagree',
    ({ block, expected, path }) => {
      // Arrange
      const input = checkInputOf(
        withBlock({
          block,
          path,
        }),
      );

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
