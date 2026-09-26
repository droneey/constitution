import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { cyclesCheck } from '../cycles';

const BIOME = 'blocks/implementations/biome/biome.md';
const LINGUI = 'blocks/implementations/lingui/lingui.md';

describe('cyclesCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = cyclesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the cycle once, at its first block, when two implementations require each other', () => {
    // Arrange
    const files = validFiles();
    files[BIOME] = mainFile({
      body: '# Biome\n',
      id: 'biome',
      kind: 'implementation',
      requires: [
        'lingui',
      ],
    });
    files[LINGUI] = mainFile({
      body: '# Lingui\n',
      id: 'lingui',
      kind: 'implementation',
      requires: [
        'biome',
      ],
    });
    const input = checkInputOf(files);

    // Act
    const findings = cyclesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is part of a dependency cycle: biome → lingui → biome',
        path: BIOME,
      },
    ]);
  });

  it('should find nothing when two implementations share a dependency without a cycle', () => {
    // Arrange
    const files = validFiles();
    files[BIOME] = mainFile({
      body: '# Biome\n',
      id: 'biome',
      kind: 'implementation',
      requires: [
        '_react',
        'react-dom',
      ],
    });
    const input = checkInputOf(files);

    // Act
    const findings = cyclesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
