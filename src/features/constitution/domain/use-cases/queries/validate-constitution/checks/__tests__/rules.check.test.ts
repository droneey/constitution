import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  rule,
  textOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { rulesCheck } from '../rules.check';

const PRINCIPLES = 'blocks/core/foundation/principles.md';
const WORKFLOW = 'blocks/core/workflow/workflow.md';
const I18N = 'blocks/domains/i18n/foundation/i18n.md';
const ANATOMY = 'blocks/core/architecture/anatomy.md';

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
        message: 'rule "b" has no Tags; a foundation rule carries a lens',
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
    files[WORKFLOW] = `# Workflow\n\n${rule({
      slug: 'dependencies-point-inward',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: `rule "dependencies-point-inward" is also defined in ${PRINCIPLES}`,
        path: WORKFLOW,
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
    {
      expected:
        'rule "i18n-plurals-by-cldr" implements "see `rules-bind`", which is not a rule',
      implementsText: 'see `rules-bind`',
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

  it.each([
    {
      condition: 'a rule on workflow implements a MUST rule on foundation',
      level: 'MUST',
      parentLevel: 'MUST',
    },
    {
      condition: 'a MUST rule implements a SHOULD rule',
      level: 'MUST',
      parentLevel: 'SHOULD',
    },
  ])(
    'should accept an Implements line when $condition in another file of the same block',
    ({ level, parentLevel }) => {
      // Arrange
      const files = validFiles();
      files[PRINCIPLES] = `# Principles\n\n${rule({
        level: parentLevel,
        slug: 'dependencies-point-inward',
      })}`;
      files[WORKFLOW] = `# Workflow\n\n${rule({
        implementsSlug: 'dependencies-point-inward',
        level,
        slug: 'rules-bind',
      })}`;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([]);
    },
  );

  it.each([
    {
      child: {
        file: PRINCIPLES,
        slug: 'dependencies-point-inward',
      },
      condition: 'a foundation rule implements a workflow rule',
      expected:
        'rule "dependencies-point-inward" implements "rules-bind" on workflow, which a rule on foundation may not refer to',
      parent: 'rules-bind',
    },
    {
      child: {
        file: ANATOMY,
        slug: 'layers-point-inward',
      },
      condition: 'an architecture rule implements a workflow rule',
      expected:
        'rule "layers-point-inward" implements "rules-bind" on workflow, which a rule on architecture may not refer to',
      parent: 'rules-bind',
    },
  ])(
    'should report the reference when $condition',
    ({ child, expected, parent }) => {
      // Arrange
      const files = validFiles();
      files[child.file] = `# Chapter\n\n${rule({
        implementsSlug: parent,
        slug: child.slug,
      })}`;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: child.file,
        },
      ]);
    },
  );

  it('should accept a rule without Tags when it sits on workflow', () => {
    // Arrange
    const files = validFiles();
    files[WORKFLOW] = [
      '# Workflow',
      '',
      '## rules-bind · MUST',
      'Rules bind.',
      '**Why:** a rule nobody follows is noise.',
      '**Check:** review',
      '',
    ].join('\n');
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a rule when it is looser than the rule it implements', () => {
    // Arrange
    const files = validFiles();
    files[WORKFLOW] = `# Workflow\n\n${rule({
      implementsSlug: 'dependencies-point-inward',
      level: 'SHOULD',
      slug: 'rules-bind',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'rule "rules-bind" is SHOULD while it implements the MUST rule "dependencies-point-inward"; a rule is never looser than the rule it implements',
        path: WORKFLOW,
      },
    ]);
  });
});
