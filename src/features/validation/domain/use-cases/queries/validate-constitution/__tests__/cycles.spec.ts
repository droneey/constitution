import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { cyclesCheck } from '../checks/cycles';

describe('cyclesCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = cyclesCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a cycle between implementations once', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/biome/biome.md'] = mainFile({
      body: '# Biome\n',
      id: 'biome',
      kind: 'implementation',
      requires: [
        'lingui',
      ],
    });
    files['blocks/implementations/lingui/lingui.md'] = mainFile({
      body: '# Lingui\n',
      id: 'lingui',
      kind: 'implementation',
      requires: [
        'biome',
      ],
    });

    // Act
    const findings = cyclesCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is part of a dependency cycle: biome → lingui → biome',
        path: 'blocks/implementations/biome/biome.md',
      },
    ]);
  });
});
