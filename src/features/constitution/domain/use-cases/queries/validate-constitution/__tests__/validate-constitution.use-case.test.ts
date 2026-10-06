import { describe, expect, it } from 'bun:test';

import { rule, sourceOf, textOf } from '../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { validateConstitution } from '../validate-constitution.use-case';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/foundation/ui.md';
const PRINCIPLES = 'blocks/core/foundation/principles.md';

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
            'is not a block file; a block holds its card <id>.md and, in foundation/, architecture/ or workflow/, its chapters and with/<block>.md',
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
            'has 509 lines; a file holds at most 500, and a longer block splits into chapters',
          path: PRINCIPLES,
        },
        {
          message: 'rule "dependencies-point-inward" has no Why',
          path: PRINCIPLES,
        },
      ],
    });
  });

  it("should give the advice beside the stale index when an added rule says nearly what a sibling block's does", () => {
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
      findings: [
        {
          message: 'differs from its regeneration; run bun run digests:write',
          path: 'digests/index.tsv',
        },
      ],
    });
  });
});
