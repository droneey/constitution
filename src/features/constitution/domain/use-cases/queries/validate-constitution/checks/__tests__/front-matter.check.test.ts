import { describe, expect, it } from 'bun:test';

import type { BlockFixture } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { frontMatterCheck } from '../front-matter.check';

const UI = 'blocks/domains/ui/ui.md';
const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BIOME = 'blocks/implementations/biome/biome.md';

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
        kind: 'domain',
      },
      expected: 'declares the id "ux"; its folder names it "ui"',
      path: UI,
    },
    {
      block: {
        body: '# Browser\n',
        id: 'browser',
        kind: 'domain',
      },
      expected:
        'declares the kind "domain"; its folder makes it a platform block, of the kind "context"',
      path: BROWSER,
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
      path: UI,
    },
    {
      block: {
        body: '# UI\n',
        extends: 'i18n',
        id: 'ui',
        kind: 'domain',
      },
      expected: 'sets "extends", which a domain block leaves empty',
      path: UI,
    },
    {
      block: {
        abstract: true,
        body: '# UI base\n',
        id: '_ui',
        kind: 'domain',
      },
      expected: 'sets "abstract", which a domain block leaves empty',
      path: 'blocks/domains/_ui/_ui.md',
    },
    {
      block: {
        body: '# Browser\n',
        checks: [
          'lint',
        ],
        id: 'browser',
        kind: 'context',
      },
      expected: 'sets "checks", which a platform block leaves empty',
      path: BROWSER,
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
      path: UI,
    },
    {
      block: {
        abstract: false,
        body: '# React\n',
        id: '_react',
        kind: 'implementation',
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
      },
      expected: 'is abstract, so its id starts with "_"',
      path: BIOME,
    },
    {
      block: {
        body: '# Biome\n',
        id: 'biome',
        kind: 'implementation',
        status: 'draft',
      },
      expected: 'is draft; a block of the constitution is stable',
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
