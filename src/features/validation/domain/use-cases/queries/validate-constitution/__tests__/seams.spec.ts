import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { seamsCheck } from '../checks/seams';

describe('seamsCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = seamsCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a with/ file named after a block it may not pair with', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/ui/with/react-dom.md'] = '# UI with React DOM\n';
    files['blocks/domains/ui/with/ui.md'] = '# UI with itself\n';
    files['blocks/domains/ui/with/core.md'] = '# UI with core\n';

    // Act
    const findings = seamsCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'is named after core, which is not a block it may pair with',
      'is named after react-dom, an implementation block; a domain block pairs only with domain blocks',
      'is named after its own block',
    ]);
  });

  it('should report a chapter that takes a block id', () => {
    // Arrange
    const files = validFiles();
    files['blocks/core/core.md'] = mainFile({
      body: '# Core\n',
      chapters: [
        'principles.md',
        'ui.md',
      ],
      id: 'core',
      kind: 'core',
    });
    files['blocks/core/ui.md'] = '# UI in core\n';

    // Act
    const findings = seamsCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'takes the id of the block ui; a file named after a block belongs in with/',
        path: 'blocks/core/ui.md',
      },
    ]);
  });
});
