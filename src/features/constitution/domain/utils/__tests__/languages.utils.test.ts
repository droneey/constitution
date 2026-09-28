import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
} from '../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../__tests__/valid-files.fixtures';
import type { Rule } from '../../entities';
import { languagesOf, ruleLanguagesOf } from '../languages.utils';

// A second language beside typescript, so that an order can show.
const PYTHON_BLOCK: Files = {
  'blocks/contexts/languages/python/python.md': mainFile({
    body: '# Python\n',
    id: 'python',
    kind: 'context',
  }),
};

const biomeRequiring = (requires: readonly string[]): Files => ({
  'blocks/implementations/biome/biome.md': mainFile({
    body: '# Biome\n',
    id: 'biome',
    kind: 'implementation',
    requires,
  }),
});

const ruleOf = (input: { block: string; with: string }): Rule => ({
  block: input.block,
  file: `blocks/${input.block}/with/${input.with}.md`,
  labels: {},
  level: 'MUST',
  slug: 'a-rule',
  statement: 'A rule holds.',
  with: input.with,
});

describe('languagesOf', () => {
  it.each([
    {
      blockId: 'typescript',
      expected: [
        'typescript',
      ],
      files: {},
      name: 'the block is a language itself',
    },
    {
      blockId: 'biome',
      expected: [
        'python',
        'typescript',
      ],
      files: {
        ...PYTHON_BLOCK,
        ...biomeRequiring([
          'typescript',
          'python',
        ]),
      },
      name: 'the block requires two languages out of order',
    },
    {
      blockId: 'biome',
      expected: [
        'typescript',
      ],
      files: biomeRequiring([
        'nowhere',
        'typescript',
      ]),
      name: 'the block also requires a block that does not exist',
    },
  ])(
    'should return the sorted languages of the block and its closure when $name',
    ({ blockId, expected, files }) => {
      // Arrange
      const { byId } = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const languages = languagesOf({
        blockId,
        byId,
      });

      // Assert
      expect(languages).toStrictEqual(expected);
    },
  );
});

describe('ruleLanguagesOf', () => {
  it.each([
    {
      block: 'biome',
      expected: [
        'typescript',
      ],
      files: {},
      name: 'both blocks have the same language',
      with: 'lingui',
    },
    {
      block: 'typescript',
      expected: [
        'python',
        'typescript',
      ],
      files: PYTHON_BLOCK,
      name: 'the blocks have different languages',
      with: 'python',
    },
  ])(
    'should return the sorted languages of both blocks, each once, when $name',
    ({ block, expected, files, with: withId }) => {
      // Arrange
      const { byId } = checkInputOf({
        ...validFiles(),
        ...files,
      });
      const rule = ruleOf({
        block,
        with: withId,
      });

      // Act
      const languages = ruleLanguagesOf({
        byId,
        rule,
      });

      // Assert
      expect(languages).toStrictEqual(expected);
    },
  );
});
