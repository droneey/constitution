import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  rule,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { rulesCheck } from '../rules';

const PRINCIPLES = 'blocks/core/principles.md';
const I18N = 'blocks/domains/i18n/i18n.md';

describe('rulesCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report every missing or malformed label when a rule breaks the rule format', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = [
      '# Principles',
      '',
      '## Not_Kebab · MUST',
      '**Why:** ',
      '**Check:** tool — spelling',
      '**Tags:** vibes',
      '',
      '## b · SHOULD',
      'B.',
      '**Why:** because.',
      '**Check:** by eye',
      '',
      '## c · MAY',
      'C.',
      '**Why:** because.',
      '**Tags:** ux',
      '',
    ].join('\n');
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'rule "Not_Kebab" is not a kebab-case slug',
      'rule "Not_Kebab" has no statement',
      'rule "Not_Kebab" has no Why',
      'rule "Not_Kebab" names the role "spelling", which is not a role',
      'rule "Not_Kebab" has the tag "vibes", which is not a lens',
      'rule "b" has the check "by eye"; a check is test, review or tool — <role>',
      'rule "b" has no Tags',
      'rule "c" has no Check',
    ]);
  });

  it('should report a rule when its slug is already defined in another file', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = `# Principles\n\n${rule({
      slug: 'rules-bind',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'rule "rules-bind" is also defined in blocks/core/core.md',
        path: PRINCIPLES,
      },
    ]);
  });

  it.each([
    {
      expected:
        'rule "i18n-plurals-by-cldr" implements "no-such-rule", which is not a rule',
      target: 'no-such-rule',
    },
    {
      expected:
        'rule "i18n-plurals-by-cldr" implements "four-data-states" of ui, which its block may not refer to',
      target: 'four-data-states',
    },
    {
      expected: 'rule "i18n-plurals-by-cldr" implements itself',
      target: 'i18n-plurals-by-cldr',
    },
  ])(
    'should report "$expected" when a rule implements $target',
    ({ expected, target }) => {
      // Arrange
      const files = validFiles();
      files[I18N] = textOf({
        files,
        path: I18N,
      }).replace('**Tags:** ux', `**Tags:** ux\n**Implements:** \`${target}\``);
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: I18N,
        },
      ]);
    },
  );

  it('should accept an Implements line when it names a rule of another file of the same block', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = `# Principles\n\n${rule({
      implementsSlug: 'rules-bind',
      slug: 'dependencies-point-inward',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
