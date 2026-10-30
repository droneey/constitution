import { describe, expect, it } from 'bun:test';

import { BlockId, RuleSlug } from '#/kernel/value-objects';

import { rule, textOf } from '../../../../../__tests__/constitution.fixtures';
import { ACME, packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import {
  loadedOf,
  packLoadedOf,
} from '../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import { FrontMatterField, FrontMatterReadCode, PlaceCode } from '../../../../block/entities';
import { LoadCode } from '../../../../constitution/entities';
import { RulesCode } from '../checks';
import { ValidationStage, validateConstitution } from '../validate-constitution.service';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/foundation/screens.md';

const similarRule = rule({
  slug: 'screens-plurals-by-cldr',
});

describe('validateConstitution', () => {
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

    const loaded = loadedOf(files);

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: false,
    });

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

    const loaded = loadedOf(files);

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: false,
    });

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

  it('should find nothing and give no advice when a pack carries out the rules of its base', () => {
    // Arrange
    const loaded = packLoadedOf({
      base: validFiles(),
      pack: packFiles(),
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
    });

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

    const loaded = packLoadedOf({
      base,
      pack: packFiles('no-such-rule'),
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
    });

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

    const loaded = packLoadedOf({
      base: validFiles(),
      pack,
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
    });

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
});
