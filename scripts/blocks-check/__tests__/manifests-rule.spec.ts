import { describe, expect, it } from 'bun:test';

import { manifestsRule } from '../rules/manifests.rule';
import { loadFiles, validFiles, without, yamlOf } from './fixtures';

const UI = 'blocks/concerns/ui/block.yml';

describe('manifestsRule', () => {
  it('should accept a sound tree', () => {
    // Act
    const findings = manifestsRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a kind that disagrees with the folder', () => {
    // Arrange
    const files = validFiles();
    files[UI] = yamlOf({
      chapters: {
        ui: 'ui.md',
      },
      kind: 'sphere',
      name: 'ui',
      summary: 'Misplaced.',
    });

    // Act
    const findings = manifestsRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'declares kind "sphere" but sits in a "concern" folder',
        path: UI,
      },
    ]);
  });

  it('should report a name that disagrees with the folder', () => {
    // Arrange
    const files = validFiles();
    files[UI] = yamlOf({
      chapters: {
        ui: 'ui.md',
      },
      kind: 'concern',
      name: 'design',
      summary: 'Misnamed.',
    });

    // Act
    const findings = manifestsRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'declares name "design" but its folder is "ui"',
        path: UI,
      },
    ]);
  });

  it('should report a chapter or template whose file is missing', () => {
    // Arrange
    const files = without(
      validFiles(),
      'blocks/concerns/ui/ui.md',
      'blocks/core/templates/PROJECT.md',
    );

    // Act
    const findings = manifestsRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'chapter "ui" points at a missing file "ui.md"',
        path: UI,
      },
      {
        message:
          'template "project" points at a missing file "templates/PROJECT.md"',
        path: 'blocks/core/block.yml',
      },
    ]);
  });

  it('should report a dependency on an unknown block or on itself', () => {
    // Arrange
    const files = validFiles();
    files[UI] = yamlOf({
      chapters: {
        ui: 'ui.md',
      },
      kind: 'concern',
      name: 'ui',
      refines: [
        'concerns/ui',
      ],
      requires: [
        'concerns/motion',
      ],
      summary: 'Lost.',
    });

    // Act
    const findings = manifestsRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'requires an unknown block "concerns/motion"',
        path: UI,
      },
      {
        message: 'refines itself',
        path: UI,
      },
    ]);
  });
});
