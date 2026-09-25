import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  validFiles,
  without,
} from '#/features/constitution/__tests__/fixtures';

import { abstractBlocksCheck } from '../checks/abstract-blocks';

describe('abstractBlocksCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = abstractBlocksCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report an abstract block with no heir', () => {
    // Arrange
    const files = without(
      validFiles(),
      'blocks/implementations/react-dom/react-dom.md',
    );

    // Act
    const findings = abstractBlocksCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is abstract and has no heir',
        path: 'blocks/implementations/_react/_react.md',
      },
    ]);
  });

  it('should report a base that names its heir, even in a code block', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/_react/_react.md'] = mainFile({
      abstract: true,
      body: '# React\n\n```ts\nimport { createRoot } from "react-dom/client";\n```\n',
      id: '_react',
      kind: 'implementation',
      owns: [
        'React',
      ],
      requires: [
        'ui',
      ],
    });

    // Act
    const findings = abstractBlocksCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'names its heir react-dom; a base knows nothing of its heirs',
        path: 'blocks/implementations/_react/_react.md',
      },
    ]);
  });
});
