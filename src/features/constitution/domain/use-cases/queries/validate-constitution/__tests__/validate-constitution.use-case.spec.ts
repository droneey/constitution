import { describe, expect, it } from 'bun:test';

import {
  rule,
  sourceOf,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { validateConstitution } from '../validate-constitution.use-case';

const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';
const UI = 'blocks/domains/ui/ui.md';

// A MUST rule whose role, architecture, no tool of typescript checks: the
// advice names it whenever the checks run.
const UNTOOLED_RULE = rule({
  check: 'tool — architecture',
  slug: 'screens-import-inward',
});

describe('validateConstitution', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const source = sourceOf(validFiles());

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [],
    });
  });

  it('should give only the structural findings, sorted, and withhold the advice when a block does not load', () => {
    // Arrange
    const files = validFiles();
    files[REMOTE_DATA] = textOf({
      files,
      path: REMOTE_DATA,
    }).replace('status: stable', 'status: stabel');
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${UNTOOLED_RULE}`;
    files['blocks/domains/ui/notes.txt'] = 'notes\n';
    const source = sourceOf(files);

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          message: 'front matter: status "stabel" is not one of stable, draft',
          path: REMOTE_DATA,
        },
        {
          message:
            'is not a block file; a block holds its main file, its chapters and with/<block>.md',
          path: 'blocks/domains/ui/notes.txt',
        },
      ],
    });
  });

  it('should give the one loader finding and withhold the advice when a single file is stray', () => {
    // Arrange
    const files = validFiles();
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${UNTOOLED_RULE}`;
    files['blocks/core/notes.txt'] = 'notes\n';
    const source = sourceOf(files);

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      findings: [
        {
          message:
            'is not a block file; a block holds its main file, its chapters and with/<block>.md',
          path: 'blocks/core/notes.txt',
        },
      ],
    });
  });

  it('should order the findings of one file by message when the checks emit them in another order', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] = [
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
            'has 508 lines; a file holds at most 500, and a longer block splits into chapters',
          path: 'blocks/core/principles.md',
        },
        {
          message: 'rule "dependencies-point-inward" has no Why',
          path: 'blocks/core/principles.md',
        },
      ],
    });
  });

  it('should give the advice beside the stale index when an added MUST rule has no tool', () => {
    // Arrange
    const files = validFiles();
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${UNTOOLED_RULE}`;
    const source = sourceOf(files);

    // Act
    const validation = validateConstitution(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [
        'role coverage: typescript has no tool for architecture',
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
