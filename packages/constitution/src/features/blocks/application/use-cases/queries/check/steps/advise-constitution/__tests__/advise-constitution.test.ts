import { describe, expect, it } from 'bun:test';

import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { RuleFixture } from '../../../../../../../__tests__/constitution.fixtures';
import { rule } from '../../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../../__tests__/valid-files.fixtures';
import type { SimilarRules } from '../../../../../../../domain/entities';
import { checkInputOf } from '../../../__tests__/check.fixtures';
import { adviseConstitution } from '../advise-constitution';

const I18N = 'blocks/domains/i18n/foundation/plurals.md';
const UI = 'blocks/domains/ui/foundation/screens.md';
const UI_WITH_REMOTE_DATA = 'blocks/domains/ui/architecture/with/remote-data.md';
const BROWSER = 'blocks/contexts/platforms/browser/architecture/render.md';
const TYPESCRIPT = 'blocks/contexts/languages/typescript/foundation/types.md';
const STATEMENT = 'Every visible label comes from a message catalog.';

interface Scenario {
  rules: Readonly<Record<string, readonly RuleFixture[]>>;
}

interface Row extends Scenario {
  expected: readonly SimilarRules[];
  name: string;
}

const inputOf = (scenario: Scenario) => {
  const files = validFiles();

  return checkInputOf({
    ...files,
    ...Object.fromEntries(
      Object.entries(scenario.rules).map(([path, rules]) => [
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
        {
          left: {
            block: BlockId.create('i18n'),
            slug: RuleSlug.create('first-rule'),
          },
          right: {
            block: BlockId.create('ui'),
            slug: RuleSlug.create('second-rule'),
          },
        },
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
        {
          left: {
            block: BlockId.create('i18n'),
            slug: RuleSlug.create('first-rule'),
          },
          right: {
            block: BlockId.create('ui'),
            slug: RuleSlug.create('second-rule'),
          },
        },
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
        {
          left: {
            block: BlockId.create('i18n'),
            slug: RuleSlug.create('first-rule'),
          },
          right: {
            block: BlockId.create('ui'),
            slug: RuleSlug.create('second-rule'),
          },
        },
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
        {
          left: {
            block: BlockId.create('i18n'),
            slug: RuleSlug.create('first-rule'),
          },
          right: {
            block: BlockId.create('ui'),
            slug: RuleSlug.create('second-rule'),
          },
        },
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
        {
          left: {
            block: BlockId.create('browser'),
            slug: RuleSlug.create('first-rule'),
          },
          right: {
            block: BlockId.create('typescript'),
            slug: RuleSlug.create('second-rule'),
          },
        },
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
      name: 'a chapter and a with/ file of one block say the same',
      ...pairOf({
        first: UI,
        left: STATEMENT,
        right: STATEMENT,
        second: UI_WITH_REMOTE_DATA,
      }),
    },
  ])('should name the similar rules of sibling blocks when $name', ({ expected, ...scenario }) => {
    // Arrange
    const input = inputOf(scenario);

    // Act
    const advice = adviseConstitution(input);

    // Assert
    expect(advice).toStrictEqual(expected);
  });
});
