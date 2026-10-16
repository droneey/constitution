import { describe, expect, it } from 'bun:test';

import { checkInputOf, mainFile } from '../../../../../../__tests__/constitution.fixtures';
import { GOLDEN_CORE, GOLDEN_INDEX } from '../../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { digestsCheck } from '../digests.check';

const COMMITTED =
  'is generated when the plugin is released and ignored by git; run git rm --cached on it';

describe('digestsCheck', () => {
  it('should find nothing when the tree holds no digest', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report every file git holds under digests/, even the digests the generator writes', () => {
    // Arrange
    const files = validFiles();
    files['digests/core.md'] = GOLDEN_CORE;
    files['digests/index.tsv'] = GOLDEN_INDEX;
    files['digests/archive/index.tsv'] = GOLDEN_INDEX;
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: COMMITTED,
        path: 'digests/archive/index.tsv',
      },
      {
        message: COMMITTED,
        path: 'digests/core.md',
      },
      {
        message: COMMITTED,
        path: 'digests/index.tsv',
      },
    ]);
  });

  it.each([
    'digests-howto.md',
    'docs/digests/overview.md',
  ])('should find nothing when %p sits outside digests/', (path) => {
    // Arrange
    const files = validFiles();
    files[path] = '# A note\n';
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should pass the core budget finding through when core passes 3,500 bytes', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/core.md'] = mainFile({
      body: `# Core\n\n${'Ω'.repeat(1750)}\n`,
      id: 'core',
    });
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'makes a core part of 3509 bytes; the digest holds at most 3500 of core',
        path: 'blocks/core/core.md',
      },
    ]);
  });
});
