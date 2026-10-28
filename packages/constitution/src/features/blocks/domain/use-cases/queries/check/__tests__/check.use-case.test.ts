import { describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId, RuleSlug } from '#/kernel/value-objects';

import { checkSourceOf, rule, textOf } from '../../../../../__tests__/constitution.fixtures';
import { ACME, packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { FrontMatterField, FrontMatterReadCode } from '../../../../entities';
import { checkBlocks, ValidationStage } from '../check.use-case';
import { RulesCode } from '../checks';
import { LoadCode, PlaceCode } from '../steps/load-constitution';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/foundation/screens.md';

const similarRule = rule({
  slug: 'screens-plurals-by-cldr',
});

describe('checkBlocks', () => {
  it('should give only the loader findings and withhold the advice when a block does not load', () => {
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
      findings: [
        {
          code: PlaceCode.StrayBlockFile,
          details: {},
          path: 'blocks/domains/ui/notes.txt',
        },
        {
          code: FrontMatterReadCode.NotBlockId,
          details: {
            entry: 'Bad',
            field: FrontMatterField.Extends,
          },
          path: REMOTE_DATA,
        },
      ],
      stage: ValidationStage.Unloaded,
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
      model: expect.any(Object),
      stage: ValidationStage.Checked,
    });
  });

  it("should check the repository's own files when the folder is its source", () => {
    // Arrange
    const files = Object.fromEntries(
      Object.entries(validFiles()).filter(([path]) => path !== 'DECISIONS.md'),
    );
    const source = checkSourceOf({
      files,
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation?.findings.map(({ path }) => path)).toContain('DECISIONS.md');
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
      model: expect.any(Object),
      stage: ValidationStage.Checked,
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
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          code: RulesCode.ParentNotRule,
          details: {
            parent: RuleSlug.create('no-such-rule'),
            slug: RuleSlug.create('acme-called-inward'),
          },
          path: ACME,
        },
      ],
      model: expect.any(Object),
      stage: ValidationStage.Checked,
    });
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
    expect(validation).toStrictEqual({
      findings: [
        {
          code: LoadCode.IdShared,
          details: {
            id: BlockId.create('i18n'),
            others: [
              '.droneey/constitution/blocks/domains/i18n/i18n.md',
            ],
          },
          path: 'blocks/domains/i18n/i18n.md',
        },
      ],
      stage: ValidationStage.Unloaded,
    });
  });

  it('should check the pack against the base its folder names when that folder holds no Constitution', () => {
    // Arrange
    const source = checkSourceOf({
      base: validFiles(),
      baseFolder: 'elsewhere',
      files: packFiles(),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation?.findings.map(({ code }) => code)).toStrictEqual([
      RulesCode.ParentNotRule,
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
      findings: [
        {
          code: LoadCode.BaseDoesNotLoad,
          details: {},
          path: '.droneey/constitution',
        },
      ],
      stage: ValidationStage.Unloaded,
    });
  });

  it('should give nothing when the folder holds no blocks', () => {
    // Arrange
    const source = {
      ...checkSourceOf({
        files: validFiles(),
      }),
      folderPath: AbsolutePath.create('/work/elsewhere'),
    };

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toBeUndefined();
  });
});
