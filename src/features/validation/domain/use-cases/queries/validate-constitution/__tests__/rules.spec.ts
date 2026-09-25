import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  rule,
  textOf,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { rulesCheck } from '../checks/rules';

const withPrinciples = (text: string) => {
  const files = validFiles();
  files['blocks/core/principles.md'] = `# Principles\n\n${text}`;

  return loadFiles(files);
};

describe('rulesCheck', () => {
  it('should accept the valid constitution', () => {
    // Act
    const findings = rulesCheck(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a missing Why, a bad check, an unknown role and an unknown tag', () => {
    // Arrange
    const text = [
      '## a · MUST',
      'A.',
      '**Check:** by eye',
      '**Tags:** vibes',
      '',
      '## b · SHOULD',
      'B.',
      '**Why:** because.',
      '**Check:** tool — spelling',
      '**Tags:** ux',
      '',
    ].join('\n');

    // Act
    const findings = rulesCheck(withPrinciples(text));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'rule "a" has no Why',
      'rule "a" has the check "by eye"; a check is test, review or tool — <role>',
      'rule "a" has the tag "vibes", which is not a lens',
      'rule "b" names the role "spelling", which is not a role',
    ]);
  });

  it('should report a rule with no statement, no Check and no Tags', () => {
    // Act
    const findings = rulesCheck(
      withPrinciples('## a · MAY\n**Why:** because.\n'),
    );

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'rule "a" has no statement',
      'rule "a" has no Check',
      'rule "a" has no Tags',
    ]);
  });

  it('should report a duplicate slug, a bad slug and a stray heading', () => {
    // Arrange
    const text = [
      rule({
        slug: 'rules-bind',
      }),
      rule({
        slug: 'Not_Kebab',
      }),
      '## c · MUSTT',
      '',
    ].join('\n');

    // Act
    const findings = rulesCheck(withPrinciples(text));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'rule "Not_Kebab" is not a kebab-case slug',
      'rule "rules-bind" is also defined in blocks/core/core.md',
      'heading "## c · MUSTT" looks like a rule but is not "## <slug> · MUST|SHOULD|MAY"',
    ]);
  });

  it('should report an Implements that is unknown or points sideways', () => {
    // Arrange
    const files = validFiles();
    files['blocks/domains/i18n/i18n.md'] = textOf(
      files,
      'blocks/domains/i18n/i18n.md',
    ).replace(
      '**Tags:** ux',
      '**Tags:** ux\n**Implements:** `four-data-states`',
    );
    files['blocks/core/principles.md'] = `# Principles\n\n${rule({
      implementsSlug: 'no-such-rule',
      slug: 'laws-hold',
    })}`;

    // Act
    const findings = rulesCheck(loadFiles(files));

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      'rule "laws-hold" implements "no-such-rule", which is not a rule',
      'rule "i18n-plurals-by-cldr" implements "four-data-states" of ui, which its block may not refer to',
    ]);
  });
});
