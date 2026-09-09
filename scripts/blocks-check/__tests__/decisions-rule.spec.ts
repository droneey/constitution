import { describe, expect, it } from 'bun:test';

import { decisionsRule } from '../rules/decisions.rule';
import { loadFiles, validFiles, without } from './fixtures';

describe('decisionsRule', () => {
  it('should accept a contiguous log', () => {
    // Act
    const findings = decisionsRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a missing log', () => {
    // Arrange
    const files = without(validFiles(), 'DECISIONS.md');

    // Act
    const findings = decisionsRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is missing; the constitution keeps its decision log at the root',
        path: 'DECISIONS.md',
      },
    ]);
  });

  it('should report a skipped and a repeated number', () => {
    // Arrange
    const files = validFiles();
    files['DECISIONS.md'] =
      '# Decisions\n\n## ADR-0001 — First\n\n## ADR-0003 — Third\n\n## ADR-0003 — Third again\n';

    // Act
    const findings = decisionsRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'entry ADR-0003 sits where ADR-0002 is expected; the log is contiguous and append-only',
        path: 'DECISIONS.md',
      },
    ]);
  });
});
