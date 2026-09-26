import { describe, expect, it } from 'bun:test';

import {
  rule,
  sourceOf,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { validateConstitution } from '../validate-constitution.use-case';

describe('validateConstitution', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const source = sourceOf(validFiles());

    // Act
    const findings = validateConstitution(source);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report only the structural findings when a block does not load', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/remote-data/remote-data.md'] = textOf({
      files,
      path: 'blocks/domains/remote-data/remote-data.md',
    }).replace('status: stable', 'status: stabel');
    files['blocks/domains/ui/notes.txt'] = 'notes\n';
    const source = sourceOf(files);

    // Act
    const findings = validateConstitution(source);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'front matter: status "stabel" is not one of stable, draft',
        path: 'blocks/domains/remote-data/remote-data.md',
      },
      {
        message:
          'is not a block file; a block holds its main file, its chapters and with/<block>.md',
        path: 'blocks/domains/ui/notes.txt',
      },
    ]);
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
    const findings = validateConstitution(source);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'has 508 lines; a file holds at most 500, and a longer block splits into chapters',
        path: 'blocks/core/principles.md',
      },
      {
        message: 'rule "dependencies-point-inward" has no Why',
        path: 'blocks/core/principles.md',
      },
    ]);
  });
});
