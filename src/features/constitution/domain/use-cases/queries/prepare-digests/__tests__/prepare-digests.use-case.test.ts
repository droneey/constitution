import { describe, expect, it } from 'bun:test';

import {
  sourceOf,
  textOf,
} from '../../../../../__tests__/constitution.fixtures';
import {
  GOLDEN_CORE,
  GOLDEN_INDEX,
} from '../../../../../__tests__/valid-digests.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { prepareDigests } from '../prepare-digests.use-case';

const CORE = 'blocks/core/core.md';
const HEADING = '# Core\n';
const REMOTE_DATA = 'blocks/domains/remote-data/remote-data.md';

describe('prepareDigests', () => {
  it('should prepare the digests with their budget finding when the constitution loads and the core part is too long', () => {
    // Arrange
    const paragraph = 'x'.repeat(3500);
    const files = validFiles();
    files[CORE] = textOf({
      files,
      path: CORE,
    }).replace(HEADING, `${HEADING}\n${paragraph}\n`);
    const source = sourceOf(files);

    // Act
    const prepared = prepareDigests(source);

    // Assert
    expect(prepared).toStrictEqual({
      digests: {
        core: GOLDEN_CORE.replace(HEADING, `${HEADING}\n${paragraph}\n`),
        findings: [
          {
            message:
              'makes a core part of 3716 bytes; the digest holds at most 3500 of core',
            path: CORE,
          },
        ],
        index: GOLDEN_INDEX,
      },
      status: 'prepared',
    });
  });

  it('should refuse with the loader findings in path order when the constitution does not load', () => {
    // Arrange
    const files = validFiles();
    files[REMOTE_DATA] = textOf({
      files,
      path: REMOTE_DATA,
    }).replace('status: stable', 'status: stabel');
    files['blocks/domains/ui/notes.txt'] = 'notes\n';
    const source = sourceOf(files);

    // Act
    const prepared = prepareDigests(source);

    // Assert
    expect(prepared).toStrictEqual({
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
      status: 'refused',
    });
  });
});
