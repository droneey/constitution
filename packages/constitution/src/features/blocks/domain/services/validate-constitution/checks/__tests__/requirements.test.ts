import { describe, expect, it } from 'bun:test';

import { Met } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import { rule, textOf } from '../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { CheckInput } from '../../check.types';
import type { RequirementsDetails } from '../requirements';
import { RequirementsCode, requirementsCheck } from '../requirements';

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
      {
        code: RequirementsCode.OutsideImplementation,
        details: {},
        path,
      },
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
        {
          code: RequirementsCode.OutsidePassport,
          details: {},
          path,
        },
      ]);
    },
  );

  it.each<{
    finding: FindingOf<RequirementsDetails>;
    row: string;
  }>([
    {
      finding: {
        code: RequirementsCode.NotRule,
        details: {
          requirement: RuleSlug.create('no-such-rule'),
        },
        path: LINGUI,
      },
      row: '| `no-such-rule` | x | yes |',
    },
    {
      finding: {
        code: RequirementsCode.OutOfReach,
        details: {
          owner: BlockId.create('react-dom'),
          requirement: RuleSlug.create('portals-for-overlays'),
        },
        path: LINGUI,
      },
      row: '| `portals-for-overlays` | x | yes |',
    },
    {
      finding: {
        code: RequirementsCode.MetUnknown,
        details: {
          met: 'met',
          requirement: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: LINGUI,
      },
      row: '| `i18n-plurals-by-cldr` | ICU plural | met |',
    },
    {
      finding: {
        code: RequirementsCode.WithoutHow,
        details: {
          requirement: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: LINGUI,
      },
      row: '| `i18n-plurals-by-cldr` |  | yes |',
    },
  ])('should report $finding.code when a row breaks its rule', ({ finding, row }) => {
    // Arrange
    const input = answering([
      row,
    ]);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      finding,
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
      {
        code: RequirementsCode.Repeated,
        details: {
          requirement: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: LINGUI,
      },
    ]);
  });

  it.each([
    {
      met: Met.Partly,
      row: '| `i18n-plurals-by-cldr` | ICU plural; catalogs-compile does the rest | partly |',
    },
    {
      met: Met.No,
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
        {
          code: RequirementsCode.WithoutCover,
          details: {
            met,
            requirement: RuleSlug.create('i18n-plurals-by-cldr'),
          },
          path: LINGUI,
        },
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
      {
        code: RequirementsCode.OwnRule,
        details: {
          requirement: RuleSlug.create('catalogs-compile'),
        },
        path: LINGUI,
      },
    ]);
  });
});
