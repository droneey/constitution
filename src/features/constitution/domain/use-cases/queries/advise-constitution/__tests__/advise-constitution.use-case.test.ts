import { describe, expect, it } from 'bun:test';

import type {
  Files,
  RuleFixture,
} from '../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
  rule,
} from '../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { adviseConstitution } from '../advise-constitution.use-case';

const I18N = 'blocks/domains/i18n/i18n.md';
const UI = 'blocks/domains/ui/ui.md';
const UI_WITH_REMOTE_DATA = 'blocks/domains/ui/with/remote-data.md';
const BROWSER = 'blocks/contexts/platforms/browser/browser.md';
const BROWSER_WITH_TYPESCRIPT =
  'blocks/contexts/platforms/browser/with/typescript.md';
const TYPESCRIPT = 'blocks/contexts/languages/typescript/typescript.md';
const TYPESCRIPT_WITH_CSS = 'blocks/contexts/languages/typescript/with/css.md';
const PYTHON = 'blocks/contexts/languages/python/python.md';
const CSS = 'blocks/contexts/languages/css/css.md';
const BIOME = 'blocks/implementations/biome/biome.md';
const PRETTIER = 'blocks/implementations/prettier/prettier.md';
const STATEMENT = 'Every visible label comes from a message catalog.';

// A second language no tool is built for: the lint rule of _react holds for
// every language, so python has no tool for lint.
const PYTHON_FILE = mainFile({
  body: '# Python\n',
  id: 'python',
  kind: 'context',
});

const CSS_FILE = mainFile({
  body: '# CSS\n',
  id: 'css',
  kind: 'context',
});

const prettierFile = (checks: readonly string[]): string =>
  mainFile({
    body: '# Prettier\n',
    checks,
    id: 'prettier',
    kind: 'implementation',
    requires: [
      'typescript',
      'css',
    ],
  });

interface Scenario {
  files?: Readonly<Files>;
  // Rules added at the end of a file; a with/ file not there yet starts as a
  // bare seam.
  rules?: Readonly<Record<string, readonly RuleFixture[]>>;
}

interface Row extends Scenario {
  expected: readonly string[];
  name: string;
}

const inputOf = (scenario: Scenario) => {
  const files = {
    ...validFiles(),
    ...scenario.files,
  };

  return checkInputOf({
    ...files,
    ...Object.fromEntries(
      Object.entries(scenario.rules ?? {}).map(([path, rules]) => [
        path,
        [
          files[path] ?? '# Seam\n',
          ...rules.map(rule),
        ].join('\n'),
      ]),
    ),
  });
};

const pairOf = (input: {
  first: string;
  left: string;
  right: string;
  second: string;
}): Scenario => ({
  rules: {
    [input.first]: [
      {
        slug: 'first-rule',
        statement: input.left,
      },
    ],
    [input.second]: [
      {
        slug: 'second-rule',
        statement: input.right,
      },
    ],
  },
});

describe('adviseConstitution', () => {
  it.each<Row>([
    {
      expected: [
        'role coverage: typescript has no tool for unused, architecture',
      ],
      name: 'MUST rules of blocks with no language need roles no tool checks, one of them twice',
      rules: {
        [I18N]: [
          {
            check: 'tool — unused',
            slug: 'every-message-is-used',
          },
        ],
        [UI]: [
          {
            check: 'tool — architecture',
            slug: 'screens-hold-no-logic',
          },
          {
            check: 'tool — unused',
            slug: 'no-unused-screen',
          },
        ],
      },
    },
    {
      expected: [
        'role coverage: python has no tool for lint',
        'role coverage: typescript has no tool for architecture',
      ],
      name: 'a MUST rule sits in a with/ file named after typescript, its own block has no language and python has no tool',
      files: {
        [PYTHON]: PYTHON_FILE,
      },
      rules: {
        [BROWSER_WITH_TYPESCRIPT]: [
          {
            check: 'tool — architecture',
            slug: 'layers-import-downward',
          },
        ],
      },
    },
    {
      expected: [
        'role coverage: css has no tool for architecture',
        'role coverage: typescript has no tool for architecture',
      ],
      name: 'a MUST rule sits in a with/ file that pairs typescript with css',
      files: {
        [CSS]: CSS_FILE,
        [PRETTIER]: prettierFile([
          'lint',
        ]),
      },
      rules: {
        [TYPESCRIPT_WITH_CSS]: [
          {
            check: 'tool — architecture',
            slug: 'layers-import-downward',
          },
        ],
      },
    },
    {
      expected: [
        'role coverage: css has no tool for lint',
      ],
      name: 'a tool spans typescript and css and checks the role a MUST rule needs',
      files: {
        [CSS]: CSS_FILE,
        [PRETTIER]: prettierFile([
          'architecture',
        ]),
      },
      rules: {
        [UI]: [
          {
            check: 'tool — architecture',
            slug: 'screens-hold-no-logic',
          },
        ],
      },
    },
    {
      expected: [
        'role coverage: python has no tool for lint',
        'role coverage: typescript has no tool for lint',
      ],
      name: 'a tool with no language checks lint and names, which MUST rules need',
      files: {
        [BIOME]: mainFile({
          body: '# Biome\n',
          checks: [
            'lint',
            'names',
          ],
          id: 'biome',
          kind: 'implementation',
        }),
        [PYTHON]: PYTHON_FILE,
      },
      rules: {
        [UI]: [
          {
            check: 'tool — names',
            slug: 'names-follow-the-glossary',
          },
        ],
      },
    },
    {
      expected: [],
      name: 'a SHOULD rule needs a role no tool checks',
      rules: {
        [UI]: [
          {
            check: 'tool — architecture',
            level: 'SHOULD',
            slug: 'screens-hold-no-logic',
          },
        ],
      },
    },
    {
      expected: [],
      name: 'a MUST rule names an unknown role',
      rules: {
        [UI]: [
          {
            check: 'tool — linting',
            slug: 'screens-hold-no-logic',
          },
        ],
      },
    },
  ])(
    'should name the roles each language needs and no tool holds when $name',
    ({ expected, ...scenario }) => {
      // Arrange
      const input = inputOf(scenario);

      // Act
      const advice = adviseConstitution(input);

      // Assert
      expect(advice).toStrictEqual(expected);
    },
  );

  it.each<Row>([
    {
      expected: [
        'similar rules: first-rule (i18n) and second-rule (ui)',
      ],
      name: 'two domains share half their words',
      ...pairOf({
        first: I18N,
        left: 'Catalogs load lazily.',
        right: 'Catalogs load eagerly.',
        second: UI,
      }),
    },
    {
      expected: [
        'similar rules: first-rule (i18n) and second-rule (ui)',
      ],
      name: 'two domains share words of three letters',
      ...pairOf({
        first: I18N,
        left: 'Set the tab key.',
        right: 'Set the tab bar.',
        second: UI,
      }),
    },
    {
      expected: [
        'similar rules: first-rule (i18n) and second-rule (ui)',
      ],
      name: 'two domains differ only in words shorter than three letters',
      ...pairOf({
        first: I18N,
        left: 'Log in as an admin.',
        right: 'Log on to be an admin.',
        second: UI,
      }),
    },
    {
      expected: [
        'similar rules: first-rule (i18n) and second-rule (ui)',
      ],
      name: 'two domains differ only in capitalization',
      ...pairOf({
        first: I18N,
        left: STATEMENT,
        right: 'Every Visible Label Comes From A Message Catalog.',
        second: UI,
      }),
    },
    {
      expected: [],
      name: 'two domains have no word of three letters',
      ...pairOf({
        first: I18N,
        left: 'Do it.',
        right: 'Go on.',
        second: UI,
      }),
    },
    {
      expected: [
        'similar rules: first-rule (browser) and second-rule (typescript)',
      ],
      name: 'a platform and a language, one kind, say the same',
      ...pairOf({
        first: BROWSER,
        left: STATEMENT,
        right: STATEMENT,
        second: TYPESCRIPT,
      }),
    },
    {
      expected: [],
      name: 'a domain and a platform say the same',
      ...pairOf({
        first: UI,
        left: STATEMENT,
        right: STATEMENT,
        second: BROWSER,
      }),
    },
    {
      expected: [],
      name: 'the main file and a with/ file of one block say the same',
      ...pairOf({
        first: UI,
        left: STATEMENT,
        right: STATEMENT,
        second: UI_WITH_REMOTE_DATA,
      }),
    },
  ])(
    'should name the similar rules of sibling blocks when $name',
    ({ expected, ...scenario }) => {
      // Arrange
      const input = inputOf(scenario);

      // Act
      const advice = adviseConstitution(input);

      // Assert
      expect(advice).toStrictEqual(expected);
    },
  );

  it('should give the role coverage before the similar rules when both apply', () => {
    // Arrange
    const input = inputOf({
      rules: {
        [I18N]: [
          {
            slug: 'labels-come-from-catalogs',
            statement: 'Every visible label comes from the message catalog.',
          },
        ],
        [UI]: [
          {
            check: 'tool — architecture',
            slug: 'labels-from-catalogs',
            statement: STATEMENT,
          },
        ],
      },
    });

    // Act
    const advice = adviseConstitution(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: typescript has no tool for architecture',
      'similar rules: labels-come-from-catalogs (i18n) and labels-from-catalogs (ui)',
    ]);
  });
});
