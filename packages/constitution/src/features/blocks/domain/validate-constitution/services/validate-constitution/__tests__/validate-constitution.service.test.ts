import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import { chapterFile, rule, textOf } from '../../../../../__tests__/constitution.fixtures';
import { nestedBlockFiles, nestedFiles } from '../../../../../__tests__/nested-files.fixtures';
import { ACME, packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import {
  loadedOf,
  packLoadedOf,
} from '../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import { FrontMatterField, FrontMatterReadCode, PlaceCode } from '../../../../block/entities';
import { LoadCode } from '../../../../constitution/entities';
import type { BlockFinding } from '../block-finding.types';
import { DecisionsCode, RulesCode, SeamsCode, WordingCode } from '../checks';
import type { Validation } from '../validate-constitution.service';
import { ValidationStage, validateConstitution } from '../validate-constitution.service';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/@foundation/screens.md';

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
    }).replace('requires: []', 'requires: ["Bad"]');
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
            field: FrontMatterField.Requires,
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
      advised: [],
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
      advised: [],
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
      advised: [],
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
    pack['blocks/domains/i18n/@foundation/plurals.md'] = textOf({
      files: validFiles(),
      path: 'blocks/domains/i18n/@foundation/plurals.md',
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

const ACME_CALLS = 'blocks/implementations/react/acme/@architecture/calls.md';
const ACME_WITH_CORE = 'blocks/implementations/react/acme/@foundation/with/core.md';

const nestedPackOf = (statement: string): Files => ({
  ...nestedBlockFiles({
    files: {
      '@architecture/calls.md': chapterFile(
        'Calls',
        rule({
          slug: 'acme-hook-named-by-its-call',
          statement,
          tightens: 'hook-named-by-its-use',
        }),
      ),
    },
    id: 'react/acme',
    layerFolder: 'implementations',
  }),
  'DECISIONS.md': textOf({
    files: packFiles(),
    path: 'DECISIONS.md',
  }),
});

const LONG_SLOGAN =
  'Every hook of Acme is named by the call it makes to the service, so a reader finds the call by its hook.';

const seamWithCore = {
  code: SeamsCode.NotPair,
  details: {
    other: BlockId.create('core'),
  },
  path: ACME_WITH_CORE,
} satisfies BlockFinding;

const severityOf = (
  validation: Validation,
): {
  readonly advised: readonly BlockFinding[];
  readonly findings: readonly BlockFinding[];
} => ({
  advised: validation.stage === ValidationStage.Checked ? validation.advised : [],
  findings: validation.findings,
});

const sloganTooLong = {
  code: WordingCode.SloganTooLong,
  details: {
    slug: RuleSlug.create('acme-hook-named-by-its-call'),
    words: 23,
  },
  path: ACME_CALLS,
} satisfies BlockFinding;

describe('validateConstitution on a nested tree', () => {
  it('should find nothing when a pack child carries out a rule of its parent in the release', () => {
    // Arrange
    const loaded = packLoadedOf({
      base: nestedFiles(),
      pack: nestedPackOf('Every hook of Acme is named by its call.'),
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
    });

    // Assert
    expect(severityOf(validation)).toStrictEqual({
      advised: [],
      findings: [],
    });
  });

  it('should fail a pack on a finding of a MUST and advise on one of a SHOULD', () => {
    // Arrange
    const pack = nestedPackOf(LONG_SLOGAN);

    pack[ACME_WITH_CORE] = chapterFile(
      'Core',
      rule({
        slug: 'acme-with-core-holds',
      }),
    );

    const loaded = packLoadedOf({
      base: nestedFiles(),
      pack,
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
    });

    // Assert
    expect(severityOf(validation)).toStrictEqual({
      advised: [
        sloganTooLong,
      ],
      findings: [
        seamWithCore,
      ],
    });
  });

  it('should advise on a finding of a MUST that the unit lowered', () => {
    // Arrange
    const pack = nestedPackOf('Every hook of Acme is named by its call.');

    pack[ACME_WITH_CORE] = chapterFile(
      'Core',
      rule({
        slug: 'acme-with-core-holds',
      }),
    );

    const loaded = packLoadedOf({
      base: nestedFiles(),
      pack,
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
      lowered: new Map([
        [
          'seam-never-pairs-with-core-or-a-related-block',
          Level.Should,
        ],
      ]),
    });

    // Assert
    expect(severityOf(validation)).toStrictEqual({
      advised: [
        seamWithCore,
      ],
      findings: [],
    });
  });

  it('should fail the release on a finding of a SHOULD and only advise on a slug joined by "and"', () => {
    // Arrange
    const files = {
      ...nestedFiles(),
      ...nestedPackOf(LONG_SLOGAN),
      'blocks/core/@foundation/code.md': chapterFile(
        'Code',
        rule({
          slug: 'code-reads-as-prose',
        }),
        rule({
          slug: 'names-and-types-agree',
        }),
      ),
    };
    const loaded = loadedOf(files);

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: false,
    });

    const { advised, findings } = severityOf(validation);

    // Assert
    expect({
      advised,
      wording: findings.filter(({ path }) => path === ACME_CALLS),
    }).toStrictEqual({
      advised: [
        {
          code: WordingCode.SlugJoinsWithAnd,
          details: {
            slug: RuleSlug.create('names-and-types-agree'),
          },
          path: 'blocks/core/@foundation/code.md',
        },
      ],
      wording: [
        sloganTooLong,
      ],
    });
  });

  it('should fail a pack on a finding that holds no rule of placement', () => {
    // Arrange
    const pack = nestedPackOf('Every hook of Acme is named by its call.');
    const { 'DECISIONS.md': _log, ...withoutLog } = pack;
    const loaded = packLoadedOf({
      base: nestedFiles(),
      pack: withoutLog,
    });

    // Act
    const validation = validateConstitution({
      ...loaded,
      isPack: true,
    });

    // Assert
    expect(severityOf(validation)).toStrictEqual({
      advised: [],
      findings: [
        {
          code: DecisionsCode.LogMissing,
          details: {},
          path: 'DECISIONS.md',
        },
      ],
    });
  });
});
