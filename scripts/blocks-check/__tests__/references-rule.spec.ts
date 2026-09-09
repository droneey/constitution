import { describe, expect, it } from 'bun:test';

import { referencesRule } from '../rules/references.rule';
import { loadFiles, validFiles } from './fixtures';

describe('referencesRule', () => {
  it('should accept prose that names only blocks of the same kind or above', () => {
    // Act
    const findings = referencesRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a chapter that names a lower block in prose, once per block', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/intro.md'] =
      '# Intro\n\nThe web takes stacks/vite; so does every stacks/vite project, and spheres/web too.\n';

    // Act
    const findings = referencesRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'names "stacks/vite", a stack block, in prose; a core chapter names lower blocks only in manifests',
        path: 'blocks/core/intro.md',
      },
      {
        message:
          'names "spheres/web", a sphere block, in prose; a core chapter names lower blocks only in manifests',
        path: 'blocks/core/intro.md',
      },
    ]);
  });

  it('should ignore a lower block named inside a fenced code block', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/intro.md'] =
      '# Intro\n\n```yaml\nblocks:\n  - stacks/vite\n```\n\n```\nspheres/web\n```\n';

    // Act
    const findings = referencesRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
