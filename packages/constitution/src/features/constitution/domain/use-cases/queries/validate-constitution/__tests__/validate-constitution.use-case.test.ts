import { describe, expect, it } from 'bun:test';

import {
  packSourceOf,
  rule,
  sourceOf,
  textOf,
} from '../../../../../__tests__/constitution.fixtures';
import { ACME, packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { validateConstitution } from '../validate-constitution.use-case';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/screens.md';
const PRINCIPLES = 'blocks/core/principles.md';

// A rule of ui that says nearly what a rule of i18n says: the advice names the
// pair whenever the checks run.
const SIMILAR_RULE = rule({
  slug: 'screens-plurals-by-cldr',
});

describe('validateConstitution', () => {
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
    })}\n${SIMILAR_RULE}`;
    files['blocks/domains/ui/notes.txt'] = 'notes\n';
    const source = sourceOf(files);

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          message: 'front matter: extends "Bad", which is not a block id',
          path: REMOTE_DATA,
        },
        {
          message:
            "is not a block file; a block holds at its root its card <id>.md, its chapters and with/<block>.md, and in architecture/ or workflow/ that axis's chapters and with/<block>.md",
          path: 'blocks/domains/ui/notes.txt',
        },
      ],
    });
  });

  it('should order the findings of one file by message when the checks emit them in another order', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = [
      '# Principles',
      '',
      '> Governs how the code depends on itself.',
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
    const source = sourceOf(files);

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          message:
            'has 511 lines; a file holds at most 500, and a longer block splits into chapters',
          path: PRINCIPLES,
        },
        {
          message: 'rule "dependencies-point-inward" has no Why',
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
    })}\n${SIMILAR_RULE}`;
    const source = sourceOf(files);

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [
        'similar rules: i18n-plurals-by-cldr (i18n) and screens-plurals-by-cldr (ui)',
      ],
      findings: [],
    });
  });

  it('should find nothing and give no advice when a pack carries out the rules of its base', () => {
    // Arrange
    const source = packSourceOf({
      base: validFiles(),
      pack: packFiles(),
    });

    // Act
    const validation = validateConstitution(source);

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
    const source = packSourceOf({
      base,
      pack: packFiles('no-such-rule'),
    });

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation.findings.map((finding) => finding.path)).toStrictEqual([
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
    const source = packSourceOf({
      base: validFiles(),
      pack,
    });

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation.findings.map((finding) => finding.path)).toStrictEqual([
      'blocks/domains/i18n/i18n.md',
    ]);
  });

  it('should report the base once when the base it is checked against does not load', () => {
    // Arrange
    const base = validFiles();
    base['blocks/domains/ui/notes.txt'] = 'notes\n';
    const source = packSourceOf({
      base,
      pack: packFiles(),
    });

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          message:
            'is the Constitution this pack extends, and it does not load; check it before the pack',
          path: '(base)/',
        },
      ],
    });
  });
});
