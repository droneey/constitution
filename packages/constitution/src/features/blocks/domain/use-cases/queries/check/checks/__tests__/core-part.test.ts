import { describe, expect, it } from 'bun:test';

import { checkInputOf, passportFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { CorePartCode, corePartCheck } from '../core-part';

const CORE = 'blocks/core/core.md';

const withCore = (body: string): ReturnType<typeof validFiles> => {
  const files = validFiles();

  files[CORE] = passportFile({
    body,
    id: 'core',
  });

  return files;
};

describe('corePartCheck', () => {
  it('should find nothing when core keeps within 3,500 bytes', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = corePartCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report core when its text, blank lines around it aside, passes 3,500 bytes', () => {
    // Arrange
    const input = checkInputOf(withCore(`\n\n# Core\n\n${'Ω'.repeat(1750)}\n\n\n`));

    // Act
    const findings = corePartCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: CorePartCode.OverBudget,
        details: {
          budget: 3500,
          bytes: 3509,
        },
        path: CORE,
      },
    ]);
  });

  it('should find nothing when core holds exactly 3,500 bytes with its last newline', () => {
    // Arrange
    const input = checkInputOf(withCore(`# Core\n\n${'x'.repeat(3491)}\n`));

    // Act
    const findings = corePartCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should find nothing when a block other than core passes 3,500 bytes', () => {
    // Arrange
    const files = validFiles();

    files['blocks/domains/i18n/i18n.md'] = passportFile({
      body: `# i18n\n\n${'x'.repeat(4000)}\n`,
      id: 'i18n',
    });

    const input = checkInputOf(files);

    // Act
    const findings = corePartCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
