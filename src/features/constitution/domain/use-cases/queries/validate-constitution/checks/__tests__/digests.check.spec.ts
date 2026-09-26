import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
  rule,
  without,
} from '../../../../../../__tests__/constitution.fixtures';
import { GOLDEN_INDEX } from '../../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { digestsCheck } from '../digests.check';

const INDEX = 'digests/index.tsv';
const CORE = 'digests/core.md';

describe('digestsCheck', () => {
  it('should report the index as stale when it differs from its regeneration only by its last newline', () => {
    // Arrange
    const files = validFiles();
    files[INDEX] = GOLDEN_INDEX.slice(0, -1);
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'differs from its regeneration; run bun run digests:write',
        path: INDEX,
      },
    ]);
  });

  it('should report both digests when they are missing', () => {
    // Arrange
    const files = without({
      files: without({
        files: validFiles(),
        path: INDEX,
      }),
      path: CORE,
    });
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is missing; run bun run digests:write',
        path: INDEX,
      },
      {
        message: 'is missing; run bun run digests:write',
        path: CORE,
      },
    ]);
  });

  it('should report a file under digests/ when the generator does not write it, even one named like a digest', () => {
    // Arrange
    const path = 'digests/archive/index.tsv';
    const files = validFiles();
    files[path] = GOLDEN_INDEX;
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is not a digest the generator writes; delete it',
        path,
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
      body: `# Core\n\n${'Ω'.repeat(1750)}\n\n${rule({
        slug: 'rules-bind',
      })}`,
      chapters: [
        'principles.md',
      ],
      id: 'core',
      kind: 'core',
    });
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'makes a core part of 3669 bytes; the digest holds at most 3500 of core',
        path: 'blocks/core/core.md',
      },
      {
        message: 'differs from its regeneration; run bun run digests:write',
        path: CORE,
      },
    ]);
  });
});
