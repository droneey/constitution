import { describe, expect, it } from 'bun:test';

import { createFakeDigestWriter } from '#/features/constitution/__tests__/fake-digest-writer';

import { writeDigests } from '../write-digests.use-case';

describe('writeDigests', () => {
  it('should write the index and the core part to their paths when given digests', () => {
    // Arrange
    const writer = createFakeDigestWriter();
    const digests = {
      core: '# Core\n',
      findings: [],
      index: '# header\n',
    };

    // Act
    writeDigests({
      digests,
      writer,
    });

    // Assert
    expect(writer.written).toStrictEqual({
      'digests/core.md': '# Core\n',
      'digests/index.tsv': '# header\n',
    });
  });
});
