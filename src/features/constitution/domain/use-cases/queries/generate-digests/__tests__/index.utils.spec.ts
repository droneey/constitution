import { describe, expect, it } from 'bun:test';

import type { Files } from '#/features/constitution/__tests__/fixtures';
import {
  checkInputOf,
  mainFile,
  rule,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { GOLDEN_INDEX } from '#/features/constitution/__tests__/valid-digests';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { indexOf } from '../index.utils';

interface ListCase {
  files: Files;
  key: string;
  list: string;
  record: string;
}
const PRINCIPLES = 'blocks/core/principles.md';
const LINGUI = 'blocks/implementations/lingui/lingui.md';
const LINGUI_BASE = textOf({
  files: validFiles(),
  path: LINGUI,
});
const CSS_FILE = mainFile({
  body: '# CSS\n',
  id: 'css',
  kind: 'context',
});
const SEAM_FILES: Files = {
  'blocks/contexts/languages/css/css.md': CSS_FILE,
  'blocks/contexts/languages/typescript/with/css.md': `# Seam\n\n${rule({
    slug: 'typed-styles',
  })}`,
  'blocks/contexts/platforms/browser/with/typescript.md': `# Seam\n\n${rule({
    slug: 'typed-events',
  })}`,
};
const recordsOf = (input: { index: string; key: string }): readonly string[] =>
  input.index.split('\n').filter((line) => line.startsWith(`${input.key}\t`));
describe('indexOf', () => {
  it('should write a record per role, block, rule and answer in the index order when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const index = indexOf(input);

    // Assert
    expect(index).toBe(GOLDEN_INDEX);
  });
  it.each([
    {
      level: 'SHOULD',
    },
    {
      level: 'MAY',
    },
    {
      check: 'by eye',
      kind: '',
      role: '',
    },
    {
      check: 'tool — lint',
      kind: 'tool',
      role: 'lint',
    },
    {
      check: 'test',
      kind: 'test',
      role: '',
    },
  ])(
    'should write the level $level and the check kind "$kind" with role "$role" in the rule record when the rule holds level $level and Check "$check"',
    ({ check = 'review', kind = 'review', level = 'MUST', role = '' }) => {
      // Arrange
      const files = validFiles();
      files[PRINCIPLES] = `# Principles\n\n${rule({
        check,
        level,
        slug: 'dependencies-point-inward',
      })}`;
      const input = checkInputOf(files);

      // Act
      const index = indexOf(input);

      // Assert
      expect(
        recordsOf({
          index,
          key: 'rule\tdependencies-point-inward',
        }),
      ).toStrictEqual([
        `rule\tdependencies-point-inward\tcore\tblocks/core/principles.md\t\t${level}\t${kind}\t${role}\t\tarchitecture\tThe dependencies-point-inward rule holds.`,
      ]);
    },
  );
  it.each([
    {
      expected: 'answer\tlingui\ti18n-plurals-by-cldr\tnot met',
      lingui: LINGUI_BASE.replace('| met |', '| not met |'),
      name: 'the Requirements row says not met',
    },
    {
      expected: 'answer\tlingui\ti18n-plurals-by-cldr\tpartial',
      lingui: LINGUI_BASE.replace('| met |', '| partial: no ordinals |'),
      name: 'the Requirements row says partial: no ordinals',
    },
    {
      expected:
        'answer\tlingui\ti18n-plurals-by-cldr\tmet\nanswer\tlingui\tfour-data-states\tnot met',
      lingui: `${LINGUI_BASE}| \`four-data-states\` | loaders | not met |\n`,
      name: 'the Requirements table holds two rows',
    },
  ])(
    'should write the answer records in row order when $name',
    ({ expected, lingui }) => {
      // Arrange
      const files = validFiles();
      files[LINGUI] = lingui;
      const input = checkInputOf(files);

      // Act
      const index = indexOf(input);

      // Assert
      expect(
        recordsOf({
          index,
          key: 'answer\tlingui',
        }),
      ).toStrictEqual(expected.split('\n'));
    },
  );
  it.each<ListCase>([
    {
      files: SEAM_FILES,
      key: 'rule\ttyped-events',
      list: "a with/ rule's one language, taken from its with target",
      record:
        'rule\ttyped-events\tbrowser\tblocks/contexts/platforms/browser/with/typescript.md\ttypescript\tMUST\treview\t\ttypescript\tarchitecture\tThe typed-events rule holds.',
    },
    {
      files: {
        'blocks/domains/forms/alpha.md': '# Alpha\n',
        'blocks/domains/forms/forms.md': mainFile({
          body: '# Forms\n',
          chapters: [
            'zeta.md',
            'alpha.md',
          ],
          id: 'forms',
          kind: 'domain',
        }),
        'blocks/domains/forms/zeta.md': '# Zeta\n',
      },
      key: 'block\tforms',
      list: "a block's chapters in reading order",
      record:
        'block\tforms\tdomain\tThe forms block.\tzeta.md alpha.md\t\t\t\tfalse\t\t\t\t\t',
    },
    {
      files: {
        'blocks/domains/ui/with/i18n.md': '# UI with i18n\n',
      },
      key: 'block\tui',
      list: "a block's with/ ids",
      record:
        'block\tui\tdomain\tThe ui block.\t\ti18n remote-data\t\t\tfalse\t\t\t\t\t**/ui/**',
    },
    {
      files: {
        'blocks/domains/forms/forms.md': mainFile({
          body: '# Forms\n',
          governs: [
            '**/forms/**',
            '**/*.form.ts',
          ],
          id: 'forms',
          kind: 'domain',
        }),
      },
      key: 'block\tforms',
      list: "a block's governs globs as written",
      record:
        'block\tforms\tdomain\tThe forms block.\t\t\t\t\tfalse\t\t\t\t\t**/forms/** **/*.form.ts',
    },
    {
      files: {
        'blocks/implementations/react-native/react-native.md': mainFile({
          body: '# React Native\n',
          extends: '_react',
          id: 'react-native',
          kind: 'implementation',
        }),
      },
      key: 'block\t_react',
      list: "a block's heirs by id",
      record:
        'block\t_react\timplementation\tThe _react block.\t\t\tui\t\ttrue\treact-dom react-native\t\t\t\t',
    },
    {
      files: {
        'blocks/contexts/languages/css/css.md': CSS_FILE,
        'blocks/implementations/prettier/prettier.md': mainFile({
          body: '# Prettier\n',
          id: 'prettier',
          kind: 'implementation',
          requires: [
            'typescript',
            'css',
          ],
        }),
      },
      key: 'block\tprettier',
      list: "a block's languages by id",
      record:
        'block\tprettier\timplementation\tThe prettier block.\t\t\ttypescript css\t\tfalse\t\t\tcss typescript\t\t',
    },
    {
      files: {
        'blocks/implementations/next/next.md': mainFile({
          body: '# Next\n',
          extends: 'react-dom',
          id: 'next',
          kind: 'implementation',
        }),
      },
      key: 'block\tnext',
      list: "a block's ancestors, nearest first",
      record:
        'block\tnext\timplementation\tThe next block.\t\t\t\treact-dom\tfalse\t\t\t\treact-dom _react\t',
    },
    {
      files: SEAM_FILES,
      key: 'rule\ttyped-styles',
      list: "a with/ rule's languages by id",
      record:
        'rule\ttyped-styles\ttypescript\tblocks/contexts/languages/typescript/with/css.md\tcss\tMUST\treview\t\tcss typescript\tarchitecture\tThe typed-styles rule holds.',
    },
    {
      files: {
        'blocks/domains/ui/states.md': '# States\n',
        'blocks/domains/ui/ui.md': mainFile({
          body: `# UI\n\n${rule({
            slug: 'four-data-states',
            statement: 'See [x](states.md#a), `[y](z.md)`, [w](https://e.co)',
          })}`,
          chapters: [
            'states.md',
          ],
          id: 'ui',
          kind: 'domain',
        }),
      },
      key: 'rule\tfour-data-states',
      list: "a rule's headline with its local links rewritten from the root",
      record:
        'rule\tfour-data-states\tui\tblocks/domains/ui/ui.md\t\tMUST\treview\t\t\tarchitecture\tSee [x](blocks/domains/ui/states.md#a), `[y](z.md)`, [w](https://e.co)',
    },
    {
      files: {
        'blocks/domains/ui/with/remote-data.md': `# Seam\n\n${rule({
          slug: 'seam-rule',
          statement: 'A write rolls back to [the ui block](../ui.md).',
        })}`,
      },
      key: 'rule\tseam-rule',
      list: "a with/ rule's headline with its relative link rewritten from the root",
      record:
        'rule\tseam-rule\tui\tblocks/domains/ui/with/remote-data.md\tremote-data\tMUST\treview\t\t\tarchitecture\tA write rolls back to [the ui block](blocks/domains/ui/ui.md).',
    },
  ])(
    'should write $list in the record when the constitution has it',
    ({ files, key, record }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const index = indexOf(input);

      // Assert
      expect(
        recordsOf({
          index,
          key,
        }),
      ).toStrictEqual([
        record,
      ]);
    },
  );
});
