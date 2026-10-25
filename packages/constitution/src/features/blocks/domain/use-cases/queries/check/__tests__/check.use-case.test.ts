import { describe, expect, it } from 'bun:test';

import { BlockId, RuleSlug } from '#/kernel/value-objects';

import { checkSourceOf, rule, textOf } from '../../../../../__tests__/constitution.fixtures';
import { ACME, packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { checkBlocks } from '../check.use-case';
import { BudgetCode, RulesCode } from '../checks';
import {
  FrontMatterField,
  FrontMatterReadCode,
  LoadCode,
  PlaceCode,
} from '../steps/load-constitution';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/foundation/screens.md';
const PRINCIPLES = 'blocks/core/foundation/principles.md';

// A rule of ui that says nearly what a rule of i18n says: the advice names the
// pair whenever the checks run.
const similarRule = rule({
  slug: 'screens-plurals-by-cldr',
});

describe('checkBlocks', () => {
  it('should give only the loader findings, sorted, and withhold the advice when a block does not load', () => {
    // Arrange
    const files = validFiles();

    files[REMOTE_DATA] = textOf({
      files,
      path: REMOTE_DATA,
    }).replace('extends: null', 'extends: Bad');
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${similarRule}`;
    files['blocks/domains/ui/notes.txt'] = 'notes\n';

    const source = checkSourceOf({
      files,
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          code: FrontMatterReadCode.NotBlockId,
          details: {
            entry: 'Bad',
            field: FrontMatterField.Extends,
          },
          path: REMOTE_DATA,
        },
        {
          code: PlaceCode.StrayBlockFile,
          details: {},
          path: 'blocks/domains/ui/notes.txt',
        },
      ],
    });
  });

  it('should order the findings of one file by code when the checks emit them in another order', () => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = [
      '# Principles',
      '',
      '> Governs how the code depends on itself.',
      '',
      '## General',
      '',
      rule({
        slug: 'dependencies-point-inward',
        why: '',
      }),
      ...Array.from(
        {
          length: 500,
        },
        () => 'Filler.',
      ),
    ].join('\n');

    const source = checkSourceOf({
      files,
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          code: BudgetCode.FileOverBudget,
          details: {
            budget: 500,
            lines: 513,
          },
          path: PRINCIPLES,
        },
        {
          code: RulesCode.WithoutWhy,
          details: {
            slug: RuleSlug.create('dependencies-point-inward'),
          },
          path: PRINCIPLES,
        },
      ],
    });
  });

  it("should give the advice without a finding when an added rule says nearly what a sibling block's does", () => {
    // Arrange
    const files = validFiles();

    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${similarRule}`;

    const source = checkSourceOf({
      files,
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [
        {
          left: {
            block: BlockId.create('i18n'),
            slug: RuleSlug.create('i18n-plurals-by-cldr'),
          },
          right: {
            block: BlockId.create('ui'),
            slug: RuleSlug.create('screens-plurals-by-cldr'),
          },
        },
      ],
      findings: [],
    });
  });

  it('should find nothing and give no advice when a pack carries out the rules of its base', () => {
    // Arrange
    const source = checkSourceOf({
      base: validFiles(),
      files: packFiles(),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [],
    });
  });

  it('should report only the pack when its rule carries out a rule neither it nor its base holds', () => {
    // Arrange
    const base = validFiles();

    base['blocks/core/core.md'] = `${textOf({
      files: base,
      path: 'blocks/core/core.md',
    })}\nSee [gone](gone.md).\n`;

    const source = checkSourceOf({
      base,
      files: packFiles('no-such-rule'),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation?.findings.map((finding) => finding.path)).toStrictEqual([
      ACME,
    ]);
  });

  it("should report the pack's block and not the base's when the pack repeats an id of its base", () => {
    // Arrange
    const pack = packFiles();

    pack['blocks/domains/i18n/i18n.md'] = textOf({
      files: validFiles(),
      path: 'blocks/domains/i18n/i18n.md',
    });
    pack['blocks/domains/i18n/foundation/plurals.md'] = textOf({
      files: validFiles(),
      path: 'blocks/domains/i18n/foundation/plurals.md',
    });

    const source = checkSourceOf({
      base: validFiles(),
      files: pack,
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation?.findings.map((finding) => finding.path)).toStrictEqual([
      'blocks/domains/i18n/i18n.md',
    ]);
  });

  it('should report the base once when the base it is checked against does not load', () => {
    // Arrange
    const base = validFiles();

    base['blocks/domains/ui/notes.txt'] = 'notes\n';

    const source = checkSourceOf({
      base,
      files: packFiles(),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          code: LoadCode.BaseDoesNotLoad,
          details: {},
          path: '/work/base',
        },
      ],
    });
  });

  it('should give nothing when the folder holds no blocks', () => {
    // Arrange
    const source = {
      ...checkSourceOf({
        files: validFiles(),
      }),
      folder: '/work/elsewhere',
    };

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toBeUndefined();
  });
});
