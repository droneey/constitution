import { describe, expect, it } from 'bun:test';

import { checkSourceOf } from '../../../../../__tests__/constitution.fixtures';
import { paraglidePack } from '../../../../../__tests__/templates.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { ValidationStage } from '../../../../../domain/validate-constitution/services';
import { checkBlocks } from '../check.use-case';

describe('checkBlocks', () => {
  it('should find nothing in a pack written from the templates when its placeholders are filled', () => {
    // Arrange
    const source = checkSourceOf({
      base: validFiles(),
      files: paraglidePack(),
    });

    // Act
    const validation = checkBlocks(source);

    // Assert
    expect(validation).toStrictEqual({
      advice: [],
      advised: [],
      findings: [],
      model: expect.any(Object),
      stage: ValidationStage.Checked,
    });
  });
});
