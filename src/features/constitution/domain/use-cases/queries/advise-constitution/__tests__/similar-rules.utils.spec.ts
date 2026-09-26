import { describe, expect, it } from 'bun:test';

import type { Files } from '#/features/constitution/__tests__/fixtures';
import {
  checkInputOf,
  rule,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { similarRules } from '../similar-rules.utils';

const I18N = 'blocks/domains/i18n/i18n.md';
const UI = 'blocks/domains/ui/ui.md';
const UI_WITH_REMOTE_DATA = 'blocks/domains/ui/with/remote-data.md';
const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const TYPESCRIPT = 'blocks/contexts/languages/typescript/typescript.md';
const BIOME = 'blocks/implementations/biome/biome.md';
const STATEMENT = 'Every visible label comes from a message catalog.';

// The text of a block file with one more rule at its end.
const withRule = (input: {
  files: Readonly<Files>;
  path: string;
  slug: string;
  statement: string;
}): string =>
  `${textOf({
    files: input.files,
    path: input.path,
  })}\n${rule({
    slug: input.slug,
    statement: input.statement,
  })}`;

describe('similarRules', () => {
  it('should name two rules of sibling blocks when their statements share half their words', () => {
    // Arrange
    const files = validFiles();
    files[I18N] = withRule({
      files,
      path: I18N,
      slug: 'labels-come-from-catalogs',
      statement: 'Every visible label comes from the message catalog.',
    });
    files[UI] = withRule({
      files,
      path: UI,
      slug: 'labels-from-catalogs',
      statement: 'Every visible label comes from a message catalog.',
    });
    const { byId, constitution } = checkInputOf(files);

    // Act
    const advice = similarRules({
      byId,
      rules: constitution.rules,
    });

    // Assert
    expect(advice).toStrictEqual([
      'similar rules: labels-come-from-catalogs (i18n) and labels-from-catalogs (ui)',
    ]);
  });

  it.each([
    {
      expected: [
        'similar rules: labels-from-catalogs (browser) and labels-come-from-catalogs (typescript)',
      ],
      first: BROWSER,
      name: 'a platform and a language',
      second: TYPESCRIPT,
    },
    {
      expected: [],
      first: UI,
      name: 'a domain and a platform',
      second: BROWSER,
    },
    {
      expected: [],
      first: UI,
      name: 'a domain and an implementation',
      second: BIOME,
    },
  ])(
    'should give $expected when similar rules sit in $name',
    ({ expected, first, second }) => {
      // Arrange
      const files = validFiles();
      files[first] = withRule({
        files,
        path: first,
        slug: 'labels-from-catalogs',
        statement: STATEMENT,
      });
      files[second] = withRule({
        files,
        path: second,
        slug: 'labels-come-from-catalogs',
        statement: STATEMENT,
      });
      const { byId, constitution } = checkInputOf(files);

      // Act
      const advice = similarRules({
        byId,
        rules: constitution.rules,
      });

      // Assert
      expect(advice).toStrictEqual(expected);
    },
  );

  it.each([
    {
      name: 'its main file',
      second: UI,
    },
    {
      name: 'its main file and a with/ file',
      second: UI_WITH_REMOTE_DATA,
    },
  ])(
    'should stay silent when two similar rules of one block sit in $name',
    ({ second }) => {
      // Arrange
      const files = validFiles();
      files[UI] = withRule({
        files,
        path: UI,
        slug: 'labels-from-catalogs',
        statement: STATEMENT,
      });
      files[second] = withRule({
        files,
        path: second,
        slug: 'labels-come-from-catalogs',
        statement: STATEMENT,
      });
      const { byId, constitution } = checkInputOf(files);

      // Act
      const advice = similarRules({
        byId,
        rules: constitution.rules,
      });

      // Assert
      expect(advice).toStrictEqual([]);
    },
  );

  it.each([
    {
      distinct: 4,
      expected: [
        'similar rules: catalogs-load-lazily (i18n) and catalogs-load-eagerly (ui)',
      ],
      left: 'Catalogs load lazily.',
      right: 'Catalogs load eagerly.',
      shared: 2,
    },
    {
      distinct: 5,
      expected: [],
      left: 'Catalogs load lazily.',
      right: 'Catalogs always load eagerly.',
      shared: 2,
    },
    {
      distinct: 5,
      expected: [
        'similar rules: catalogs-load-lazily (i18n) and catalogs-load-eagerly (ui)',
      ],
      left: 'Set the tab key.',
      right: 'Set the tab bar.',
      shared: 3,
    },
    {
      distinct: 1,
      expected: [
        'similar rules: catalogs-load-lazily (i18n) and catalogs-load-eagerly (ui)',
      ],
      left: 'Use `a`.',
      right: 'Use `b`.',
      shared: 1,
    },
    {
      distinct: 0,
      expected: [],
      left: 'Do it.',
      right: 'Go on.',
      shared: 0,
    },
  ])(
    'should give $expected when sibling statements share $shared of their $distinct words',
    ({ expected, left, right }) => {
      // Arrange
      const files = validFiles();
      files[I18N] = withRule({
        files,
        path: I18N,
        slug: 'catalogs-load-lazily',
        statement: left,
      });
      files[UI] = withRule({
        files,
        path: UI,
        slug: 'catalogs-load-eagerly',
        statement: right,
      });
      const { byId, constitution } = checkInputOf(files);

      // Act
      const advice = similarRules({
        byId,
        rules: constitution.rules,
      });

      // Assert
      expect(advice).toStrictEqual(expected);
    },
  );

  it.each([
    {
      left: 'Every visible label comes from a message catalog.',
      name: 'capitalization',
      right: 'Every Visible Label Comes From A Message Catalog.',
    },
    {
      left: 'Log in as an admin.',
      name: 'words shorter than three letters',
      right: 'Log on to be an admin.',
    },
  ])(
    'should name the pair when sibling statements differ only in $name',
    ({ left, right }) => {
      // Arrange
      const files = validFiles();
      files[I18N] = withRule({
        files,
        path: I18N,
        slug: 'i18n-statement',
        statement: left,
      });
      files[UI] = withRule({
        files,
        path: UI,
        slug: 'ui-statement',
        statement: right,
      });
      const { byId, constitution } = checkInputOf(files);

      // Act
      const advice = similarRules({
        byId,
        rules: constitution.rules,
      });

      // Assert
      expect(advice).toStrictEqual([
        'similar rules: i18n-statement (i18n) and ui-statement (ui)',
      ]);
    },
  );
});
