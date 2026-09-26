import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import {
  GOLDEN_CORE,
  GOLDEN_INDEX,
} from '#/features/constitution/__tests__/valid-digests';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { generateDigests } from '../generate-digests.use-case';

const CORE = 'blocks/core/core.md';
const HEADING = '# Core\n';

describe('generateDigests', () => {
  it('should return the index and core part without a finding when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const digests = generateDigests(input);

    // Assert
    expect(digests).toStrictEqual({
      core: GOLDEN_CORE,
      findings: [],
      index: GOLDEN_INDEX,
    });
  });

  it('should return the core part and the index with the budget finding when core.md makes the core part pass 3,500 bytes', () => {
    // Arrange
    const paragraph = 'x'.repeat(3500);
    const files = validFiles();
    files[CORE] = textOf({
      files,
      path: CORE,
    }).replace(HEADING, `${HEADING}\n${paragraph}\n`);
    const input = checkInputOf(files);

    // Act
    const digests = generateDigests(input);

    // Assert
    expect(digests).toStrictEqual({
      core: GOLDEN_CORE.replace(HEADING, `${HEADING}\n${paragraph}\n`),
      findings: [
        {
          message:
            'makes a core part of 3716 bytes; the digest holds at most 3500 of core',
          path: CORE,
        },
      ],
      index: GOLDEN_INDEX,
    });
  });
});
