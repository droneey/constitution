import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import { passportFile } from '../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { SeamsDetails } from '../seams';
import { SeamsCode, seamsCheck } from '../seams';

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
    finding: FindingOf<SeamsDetails>;
  }>([
    {
      finding: {
        code: SeamsCode.OutOfLayer,
        details: {
          allowed: [
            Layer.Domain,
            Layer.Platform,
            Layer.Language,
          ],
          layer: Layer.Platform,
          other: BlockId.create('biome'),
          otherLayer: Layer.Implementation,
        },
        path: 'blocks/contexts/platforms/browser/architecture/with/biome.md',
      },
    },
    {
      finding: {
        code: SeamsCode.NamedAfterOwnBlock,
        details: {},
        path: 'blocks/domains/ui/foundation/with/ui.md',
      },
    },
    {
      finding: {
        code: SeamsCode.NotPair,
        details: {
          other: BlockId.create('core'),
        },
        path: 'blocks/domains/ui/workflow/with/core.md',
      },
    },
    {
      finding: {
        code: SeamsCode.NotPair,
        details: {
          other: BlockId.create('nowhere'),
        },
        path: 'blocks/domains/ui/architecture/with/nowhere.md',
      },
    },
    {
      finding: {
        code: SeamsCode.AlongDependency,
        details: {
          block: BlockId.create('biome'),
          other: BlockId.create('typescript'),
        },
        path: 'blocks/implementations/biome/foundation/with/typescript.md',
      },
    },
    {
      finding: {
        code: SeamsCode.AlongDependency,
        details: {
          block: BlockId.create('react-dom'),
          other: BlockId.create('ui'),
        },
        path: 'blocks/implementations/react-dom/foundation/with/ui.md',
      },
    },
    {
      finding: {
        code: SeamsCode.BlockPairsWithNone,
        details: {
          block: BlockId.create('core'),
        },
        path: 'blocks/core/foundation/with/ui.md',
      },
    },
  ])(
    'should report $finding.code when $finding.path pairs with a block it may not',
    ({ finding }) => {
      // Arrange
      const files = validFiles();

      files[finding.path] = seamOf(finding.path);

      const input = checkInputOf(files);

      // Act
      const findings = seamsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        finding,
      ]);
    },
  );

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
      {
        code: SeamsCode.ChapterNamedAfterBlock,
        details: {
          block: BlockId.create('ui'),
        },
        path: 'blocks/core/architecture/ui.md',
      },
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
        {
          code: SeamsCode.TitleMismatch,
          details: {},
          path,
        },
      ]);
    },
  );
});
