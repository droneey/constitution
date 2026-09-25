import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { ownedWordsCheck } from '../checks/owned-words';

describe('ownedWordsCheck', () => {
  it('should accept the valid constitution, where react-dom names React through its base', () => {
    // Act
    const findings = ownedWordsCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report core naming a language, a brand and an extension in prose and inline code', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] =
      '# Principles\n\nIn TypeScript, run Biome on `chat.entity.ts`.\n';

    // Act
    const findings = ownedWordsCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message).toSorted()).toStrictEqual(
      [
        'names ".ts", which typescript owns; only typescript and the blocks that depend on it may',
        'names "Biome", which biome owns; only biome and the blocks that depend on it may',
        'names "TypeScript", which typescript owns; only typescript and the blocks that depend on it may',
      ],
    );
  });

  it('should let a fenced code block use any word', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/principles.md'] =
      '# Principles\n\n```ts\nimport React from "react"; // Biome\n```\n';

    // Act
    const findings = ownedWordsCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should let a with/ file use the words of the block it is named after', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/lingui/with/_react.md'] =
      '# Lingui with React\n\nWrap the React tree once.\n';

    // Act
    const findings = ownedWordsCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a word owned by two blocks', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/lingui/lingui.md'] = mainFile({
      body: '# Lingui\n',
      id: 'lingui',
      kind: 'implementation',
      owns: [
        'Biome',
      ],
      requires: [
        'i18n',
        'typescript',
      ],
    });

    // Act
    const findings = ownedWordsCheck(loadFiles(files));

    // Assert
    expect(findings).toContainEqual({
      message: 'owns "Biome", which biome owns already',
      path: 'blocks/implementations/lingui/lingui.md',
    });
  });
});
