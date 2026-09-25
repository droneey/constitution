import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  textOf,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { requirementsCheck } from '../checks/requirements';

const LINGUI = 'blocks/implementations/lingui/lingui.md';

const answers = (rows: readonly string[]) => {
  const files = validFiles();
  files[LINGUI] = textOf(files, LINGUI).replace(
    '| `i18n-plurals-by-cldr` | ICU plural | met |',
    rows.join('\n'),
  );

  return loadFiles(files);
};

describe('requirementsCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = requirementsCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report an unknown requirement, a bad status, an empty how, a repeat and a sideways one', () => {
    // Act
    const findings = requirementsCheck(
      answers([
        '| `no-such-rule` | x | met |',
        '| `i18n-plurals-by-cldr` | ICU plural | maybe |',
        '| `i18n-plurals-by-cldr` |  | met |',
        '| `hooks-at-top-level` | never | partial: |',
      ]),
    );

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'answers "no-such-rule", which is not a rule',
      'answers "i18n-plurals-by-cldr" with the status "maybe"; a status is met, partial: <workaround> or not met',
      'answers "i18n-plurals-by-cldr" without saying how',
      'answers "i18n-plurals-by-cldr" twice',
      'answers "hooks-at-top-level" of _react, which its block may not refer to',
      'answers "hooks-at-top-level" with the status "partial:"; a status is met, partial: <workaround> or not met',
    ]);
  });

  it('should report a Requirements table outside an implementation, once per file', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/ui/ui.md'] =
      `${files['blocks/domains/ui/ui.md']}\n## Requirements\n\n| Requirement | How | Status |\n|---|---|---|\n| \`rules-bind\` | x | met |\n| \`rules-bind\` | y | met |\n`;

    // Act
    const findings = requirementsCheck(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'answers requirements, which only an implementation does',
        path: 'blocks/domains/ui/ui.md',
      },
    ]);
  });
});
