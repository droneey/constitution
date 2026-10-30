import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { checkSourceOf } from '../../../../../__tests__/constitution.fixtures';
import { packFiles } from '../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { LoadCode } from '../../../../../domain/entities';
import { RulesCode, ValidationStage } from '../../../../../domain/services';
import { checkBlocks } from '../check.use-case';

describe('checkBlocks', () => {
  it("should check the repository's own files when the folder is its source", () => {
    // Arrange
    const files = Object.fromEntries(
      Object.entries(validFiles()).filter(([path]) => path !== 'DECISIONS.md'),
    );
    const source = checkSourceOf({
      files,
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation?.findings.map(({ path }) => path)).toContain('DECISIONS.md');
  });

  it('should check the pack against the base its folder names when that folder holds no Constitution', () => {
    // Arrange
    const source = checkSourceOf({
      base: validFiles(),
      baseFolder: 'elsewhere',
      files: packFiles(),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation?.findings.map(({ code }) => code)).toStrictEqual([
      RulesCode.ParentNotRule,
    ]);
  });

  it('should report the base once when the base it is checked against does not load', () => {
    // Arrange
    const base = validFiles();

    base['blocks/domains/ui/notes.txt'] = 'notes\n';

    const source = checkSourceOf({
      base,
      files: packFiles(),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      findings: [
        {
          code: LoadCode.BaseDoesNotLoad,
          details: {},
          path: '.droneey/constitution',
        },
      ],
      stage: ValidationStage.Unloaded,
    });
  });

  it('should give nothing when the folder holds no blocks', () => {
    // Arrange
    const source = {
      ...checkSourceOf({
        files: validFiles(),
      }),
      folderPath: AbsolutePath.create('/work/elsewhere'),
    };

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toBeUndefined();
  });
});
