import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  findingOf,
  passportFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { seamsCheck } from '../seams.check';

/** a seam titled as its other block's passport in the valid files, so only its pairing is in question */
const seamOf = (path: string): string => {
  const titles: Readonly<Record<string, string>> = {
    biome: 'Biome',
    typescript: 'TypeScript',
    ui: 'UI',
  };

  return `# ${titles[path.slice(path.lastIndexOf('/') + 1, -'.md'.length)] ?? 'Seam'}\n`;
};

describe('seamsCheck', () => {
  it.each<{
    code: string;
    names: string[];
    path: string;
  }>([
    {
      code: 'seam-out-of-layer',
      names: [
        'biome',
      ],
      path: 'blocks/contexts/platforms/browser/architecture/with/biome.md',
    },
    {
      code: 'seam-named-after-own-block',
      names: [],
      path: 'blocks/domains/ui/foundation/with/ui.md',
    },
    {
      code: 'seam-names-no-pair',
      names: [
        'core',
      ],
      path: 'blocks/domains/ui/workflow/with/core.md',
    },
    {
      code: 'seam-names-no-pair',
      names: [
        'nowhere',
      ],
      path: 'blocks/domains/ui/architecture/with/nowhere.md',
    },
    {
      code: 'seam-along-a-dependency',
      names: [
        'typescript',
      ],
      path: 'blocks/implementations/biome/foundation/with/typescript.md',
    },
    {
      code: 'seam-along-a-dependency',
      names: [
        'ui',
      ],
      path: 'blocks/implementations/react-dom/foundation/with/ui.md',
    },
    {
      code: 'seam-of-unpairing-block',
      names: [
        'core',
      ],
      path: 'blocks/core/foundation/with/ui.md',
    },
  ])('should report $code when $path pairs with a block it may not', ({ code, names, path }) => {
    // Arrange
    const files = validFiles();
    files[path] = seamOf(path);
    const input = checkInputOf(files);

    // Act
    const findings = seamsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code,
        names,
        path,
      }),
    ]);
  });

  it.each([
    'blocks/contexts/platforms/browser/foundation/with/typescript.md',
    'blocks/contexts/platforms/browser/workflow/with/ui.md',
  ])('should accept %p when it pairs with a block of its own rank or above', (path) => {
    // Arrange
    const files = validFiles();
    files[path] = seamOf(path);
    const input = checkInputOf(files);

    // Act
    const findings = seamsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a chapter named after a block when core lists it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/core.md'] = passportFile({
      body: '# Core\n',
      id: 'core',
    });
    files['blocks/core/architecture/ui.md'] = '# UI in core\n';
    const input = checkInputOf(files);

    // Act
    const findings = seamsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'chapter-named-after-block',
        names: [
          'ui',
        ],
        path: 'blocks/core/architecture/ui.md',
      }),
    ]);
  });

  it("should take the title of the other block's passport when a chapter of it is titled otherwise", () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/remote-data/foundation/caching.md'] = '# Remote data at large\n';
    const input = checkInputOf(files);

    // Act
    const findings = seamsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'is titled after both blocks',
      title: '# Browser with UI\n',
    },
    {
      condition: 'has no title',
      title: 'Text.\n',
    },
  ])(
    "should report a seam that $condition rather than as the other block's passport",
    ({ title }) => {
      // Arrange
      const path = 'blocks/contexts/platforms/browser/foundation/with/ui.md';
      const files = validFiles();
      files[path] = title;
      const input = checkInputOf(files);

      // Act
      const findings = seamsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'seam-title-mismatch',
          path,
        }),
      ]);
    },
  );
});
