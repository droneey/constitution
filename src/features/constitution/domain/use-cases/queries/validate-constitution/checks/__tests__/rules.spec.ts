import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  rule,
  textOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { rulesCheck } from '../rules';

const PRINCIPLES = 'blocks/core/principles.md';
const I18N = 'blocks/domains/i18n/i18n.md';

describe('rulesCheck', () => {
  it('should report every missing or malformed label when rules break the rule format', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = [
      '# Principles',
      '',
      '## not_Kebab · MUST',
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
      '**Tags:** ux',
      '',
    ].join('\n');
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'rule "not_Kebab" is not a kebab-case slug',
        path: PRINCIPLES,
      },
      {
        message: 'rule "not_Kebab" has no statement',
        path: PRINCIPLES,
      },
      {
        message: 'rule "not_Kebab" has no Why',
        path: PRINCIPLES,
      },
      {
        message:
          'rule "not_Kebab" names the role "spelling", which is not a role',
        path: PRINCIPLES,
      },
      {
        message: 'rule "not_Kebab" has the tag "vibes", which is not a lens',
        path: PRINCIPLES,
      },
      {
        message:
          'rule "b" has the check "by eye"; a check is test, review or tool — <role>',
        path: PRINCIPLES,
      },
      {
        message: 'rule "b" has no Tags',
        path: PRINCIPLES,
      },
      {
        message: 'rule "c" has no Why',
        path: PRINCIPLES,
      },
      {
        message: 'rule "c" has no Check',
        path: PRINCIPLES,
      },
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
        'rule "i18n-plurals-by-cldr" implements "four-data-states" of ui, which its block may not refer to',
      implementsText: '`four-data-states`',
    },
    {
      expected: 'rule "i18n-plurals-by-cldr" implements itself',
      implementsText: '`i18n-plurals-by-cldr`',
    },
    {
      expected:
        'rule "i18n-plurals-by-cldr" implements "`rules-bind` in core", which is not a rule',
      implementsText: '`rules-bind` in core',
    },
  ])(
    'should report "$expected" when a rule implements $implementsText',
    ({ expected, implementsText }) => {
      // Arrange
      const files = validFiles();
      files[I18N] = textOf({
        files,
        path: I18N,
      }).replace(
        '**Tags:** ux',
        `**Tags:** ux\n**Implements:** ${implementsText}`,
      );
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
