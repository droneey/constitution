import { describe, expect, it } from 'bun:test';

import { checkInputOf } from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import type { Rule } from '../../entities';
import { languagesOf, ruleLanguagesOf } from '../languages.utils';

const ruleOf = (input: { block: string; with: string | null }): Rule => ({
  block: input.block,
  file: `blocks/implementations/${input.block}/${input.block}.md`,
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
    },
    {
      blockId: 'biome',
      expected: [
        'typescript',
      ],
    },
    {
      blockId: 'react-dom',
      expected: [],
    },
    {
      blockId: 'core',
      expected: [],
    },
  ])(
    'should return $expected when the block is $blockId',
    ({ blockId, expected }) => {
      // Arrange
      const { byId } = checkInputOf(validFiles());

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
      name: 'the rule block has a language',
      with: null,
    },
    {
      block: 'react-dom',
      expected: [
        'typescript',
      ],
      name: 'only the with-block has a language',
      with: 'typescript',
    },
    {
      block: 'biome',
      expected: [
        'typescript',
      ],
      name: 'both blocks have the same language',
      with: 'lingui',
    },
    {
      block: 'ui',
      expected: [],
      name: 'neither block has a language',
      with: 'remote-data',
    },
  ])(
    'should return $expected when $name',
    ({ block, expected, with: withId }) => {
      // Arrange
      const { byId } = checkInputOf(validFiles());
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
