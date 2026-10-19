import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  findingOf,
  rule,
  textOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { CheckInput } from '../../check.types';
import { requirementsCheck } from '../requirements.check';

const LINGUI = 'blocks/implementations/lingui/lingui.md';
const ANSWER = '| `i18n-plurals-by-cldr` | ICU plural | yes |';

const answering = (rows: readonly string[]): CheckInput => {
  const files = validFiles();
  files[LINGUI] = textOf({
    files,
    path: LINGUI,
  }).replace(ANSWER, rows.join('\n'));

  return checkInputOf(files);
};

// Lingui with a rule of its own, which a partly or no answer may name.
const coveredBy = (rows: readonly string[]): CheckInput => {
  const files = validFiles();
  files[LINGUI] = textOf({
    files,
    path: LINGUI,
  }).replace(ANSWER, rows.join('\n'));
  files['blocks/implementations/lingui/foundation/catalogs.md'] = `# Catalogs\n\n${rule({
    slug: 'catalogs-compile',
  })}`;

  return checkInputOf(files);
};

describe('requirementsCheck', () => {
  it('should report a Requirements table once per file when a with/ file of a block that is no implementation holds one', () => {
    // Arrange
    const path = 'blocks/domains/ui/architecture/with/remote-data.md';
    const files = validFiles();
    files[path] = [
      textOf({
        files,
        path,
      }),
      '## Requirements',
      '| `four-data-states` | tests | yes |',
      '| `reads-are-cancellable` | tests | yes |',
    ].join('\n');
    const input = checkInputOf(files);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'requirements-outside-implementation',
        path,
      }),
    ]);
  });

  it.each([
    {
      name: 'a with/ file',
      path: 'blocks/implementations/biome/foundation/with/lingui.md',
    },
    {
      name: 'a chapter',
      path: 'blocks/implementations/biome/foundation/formatting.md',
    },
  ])(
    'should report $name once when an implementation answers two requirements in it',
    ({ path }) => {
      // Arrange
      const files = validFiles();
      files[path] = [
        '# Biome with Lingui',
        '',
        '## Requirements',
        '',
        '| Requirement | How | Met |',
        '|---|---|---|',
        '| `any-never-typed` | the noExplicitAny rule | yes |',
        '| `dependencies-point-inward` | review | yes |',
        '',
      ].join('\n');
      const input = checkInputOf(files);

      // Act
      const findings = requirementsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'requirements-outside-passport',
          path,
        }),
      ]);
    },
  );

  it.each<{
    code: string;
    names: readonly string[];
    row: string;
  }>([
    {
      code: 'answer-names-no-rule',
      names: [
        'no-such-rule',
      ],
      row: '| `no-such-rule` | x | yes |',
    },
    {
      code: 'answer-out-of-reach',
      names: [
        'portals-for-overlays',
        'react-dom',
      ],
      row: '| `portals-for-overlays` | x | yes |',
    },
    {
      code: 'answer-met-unknown',
      names: [
        'i18n-plurals-by-cldr',
        'met',
      ],
      row: '| `i18n-plurals-by-cldr` | ICU plural | met |',
    },
    {
      code: 'answer-without-how',
      names: [
        'i18n-plurals-by-cldr',
      ],
      row: '| `i18n-plurals-by-cldr` |  | yes |',
    },
  ])('should report $code when a row breaks its rule', ({ code, names, row }) => {
    // Arrange
    const input = answering([
      row,
    ]);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code,
        names,
        path: LINGUI,
      }),
    ]);
  });

  it('should report the second answer when a block answers one requirement twice', () => {
    // Arrange
    const input = answering([
      ANSWER,
      '| `i18n-plurals-by-cldr` | again, plurals only | yes |',
    ]);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'answer-repeated',
        names: [
          'i18n-plurals-by-cldr',
        ],
        path: LINGUI,
      }),
    ]);
  });

  it.each([
    {
      met: 'partly',
      row: '| `i18n-plurals-by-cldr` | ICU plural; catalogs-compile does the rest | partly |',
    },
    {
      met: 'no',
      row: '| `i18n-plurals-by-cldr` | none; `any-never-typed` stands in | no |',
    },
  ])(
    'should report a $met answer when it names in backticks no rule of its own block',
    ({ met, row }) => {
      // Arrange
      const input = coveredBy([
        row,
      ]);

      // Act
      const findings = requirementsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'answer-without-covering-rule',
          names: [
            'i18n-plurals-by-cldr',
            met,
          ],
          path: LINGUI,
        }),
      ]);
    },
  );

  it('should accept a partly answer when it names in backticks the rule of its own block that covers the rest', () => {
    // Arrange
    const input = coveredBy([
      '| `i18n-plurals-by-cldr` | ICU plural; `catalogs-compile` does the rest | partly |',
    ]);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report an answer when it names a rule of its own block', () => {
    // Arrange
    const files = validFiles();
    files[LINGUI] = textOf({
      files,
      path: LINGUI,
    }).replace(ANSWER, `${ANSWER}\n| \`catalogs-compile\` | the CLI | yes |`);
    files['blocks/implementations/lingui/workflow/catalogs.md'] = `# Catalogs\n\n${rule({
      slug: 'catalogs-compile',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'answer-names-own-rule',
        names: [
          'catalogs-compile',
        ],
        path: LINGUI,
      }),
    ]);
  });
});
