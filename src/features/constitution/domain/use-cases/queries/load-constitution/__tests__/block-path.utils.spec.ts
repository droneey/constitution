import { describe, expect, it } from 'bun:test';

import { classifyBlockPath } from '../block-path.utils';

describe('classifyBlockPath', () => {
  it('should classify the files of every layer', () => {
    // Act
    const paths = [
      'blocks/core/core.md',
      'blocks/core/principles.md',
      'blocks/domains/ui/ui.md',
      'blocks/domains/ui/with/remote-data.md',
      'blocks/contexts/platforms/browser/browser.md',
      'blocks/contexts/languages/typescript/typescript.md',
      'blocks/implementations/_react/_react.md',
    ].map((path) => {
      const classified = classifyBlockPath(path);

      return [
        classified?.layer,
        classified?.id,
        classified?.file,
        classified?.with,
      ];
    });

    // Assert
    expect(paths).toStrictEqual([
      [
        'core',
        'core',
        'main',
        null,
      ],
      [
        'core',
        'core',
        'chapter',
        null,
      ],
      [
        'domain',
        'ui',
        'main',
        null,
      ],
      [
        'domain',
        'ui',
        'with',
        'remote-data',
      ],
      [
        'platform',
        'browser',
        'main',
        null,
      ],
      [
        'language',
        'typescript',
        'main',
        null,
      ],
      [
        'implementation',
        '_react',
        'main',
        null,
      ],
    ]);
  });

  it('should call a hidden, nested or non-markdown file stray', () => {
    // Act
    const files = [
      'blocks/domains/ui/.DS_Store',
      'blocks/domains/ui/parts/a.md',
      'blocks/domains/ui/with/x/y.md',
      'blocks/domains/ui/notes.txt',
    ].map((path) => classifyBlockPath(path)?.file);

    // Assert
    expect(files).toStrictEqual([
      'stray',
      'stray',
      'stray',
      'stray',
    ]);
  });

  it('should return nothing for a path outside every layer folder', () => {
    // Act
    const paths = [
      'blocks/spheres/web/web.md',
      'blocks/README.md',
      'blocks/core',
      'blocks/domains/ui.md',
      'blocks/contexts/platforms/browser.md',
      'README.md',
    ].map(classifyBlockPath);

    // Assert
    expect(paths).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });
});
