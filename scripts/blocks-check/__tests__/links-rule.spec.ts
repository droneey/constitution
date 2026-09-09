import { describe, expect, it } from 'bun:test';

import { linksRule } from '../rules/links.rule';
import { loadFiles, validFiles, without } from './fixtures';

describe('linksRule', () => {
  it('should accept links that resolve', () => {
    // Act
    const findings = linksRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should ignore external links and anchors', () => {
    // Arrange
    const files = validFiles();
    files['blocks/concerns/ui/ui.md'] =
      '# UI\n\nSee [the spec](https://example.com/spec), [mail](mailto:a@b.c) and [below](#rules).\n';

    // Act
    const findings = linksRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a link to a missing file from a chapter and from the readme', () => {
    // Arrange
    const files = validFiles();
    files['blocks/concerns/ui/ui.md'] =
      '# UI\n\nSee [tokens](../../core/tokens.md#layers) and [code](../../languages/typescript/code.md).\n';
    files['README.md'] = '# constitution\n\nSee [the map](blocks/map.md).\n';

    // Act
    const findings = linksRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'links to a missing file "../../core/tokens.md"',
        path: 'blocks/concerns/ui/ui.md',
      },
      {
        message: 'links to a missing file "blocks/map.md"',
        path: 'README.md',
      },
    ]);
  });

  it('should check nothing at the root when the readme is absent', () => {
    // Arrange
    const files = without(validFiles(), 'README.md');

    // Act
    const findings = linksRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
