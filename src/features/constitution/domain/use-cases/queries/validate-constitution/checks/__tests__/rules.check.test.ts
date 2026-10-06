import { describe, expect, it } from 'bun:test';

import { checkInputOf, rule } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { rulesCheck } from '../rules.check';

const PRINCIPLES = 'blocks/core/principles.md';
const WORKFLOW = 'blocks/core/workflow/workflow.md';
const I18N = 'blocks/domains/i18n/plurals.md';
const REMOTE_DATA = 'blocks/domains/remote-data/architecture/remote-data.md';
const UI = 'blocks/domains/ui/screens.md';
const UI_WITH_REMOTE_DATA = 'blocks/domains/ui/architecture/with/remote-data.md';
const PORTALS = 'blocks/implementations/react-dom/workflow/portals.md';

describe('rulesCheck', () => {
  it('should report every empty or malformed field when rules break the rule format', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = [
      '# Principles',
      '',
      '### not_Kebab · MUST',
      '',
      '| Why | Tags |',
      '|---|---|',
      '|  | [vibes, ux] |',
      '',
      rule({
        slug: 'b',
        tags: '[types]',
      }),
      rule({
        slug: 'c',
        why: '',
      }),
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
        message: 'rule "not_Kebab" has the tag "vibes", which is not a lens',
        path: PRINCIPLES,
      },
      {
        message: 'rule "b" has the tag "types", which is not a lens',
        path: PRINCIPLES,
      },
      {
        message: 'rule "c" has no Why',
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
        'rule "i18n-plurals-by-cldr" carries out "four-data-states" of ui, which its block may not refer to',
      parent: 'four-data-states',
    },
    {
      expected:
        'rule "i18n-plurals-by-cldr" carries out a chain that comes back to it: i18n-plurals-by-cldr → i18n-plurals-by-cldr',
      parent: 'i18n-plurals-by-cldr',
    },
    {
      expected: 'rule "i18n-plurals-by-cldr" carries out "plurals-by-icu", which is not a rule',
      parent: 'plurals-by-icu',
    },
  ])('should report "$expected" when a rule carries out $parent', ({ expected, parent }) => {
    // Arrange
    const files = validFiles();
    files[I18N] = `# i18n\n\n${rule({
      parent,
      slug: 'i18n-plurals-by-cldr',
      tags: '[ux]',
    })}`;
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
  });

  it.each([
    {
      expected:
        'rule "portals-for-overlays" carries out "optimistic-writes-roll-back" of ui with remote-data, which its place does not reach',
      parent: 'optimistic-writes-roll-back',
    },
    {
      expected:
        'rule "portals-for-overlays" carries out "i18n-plurals-by-cldr" of i18n, which its block may not refer to',
      parent: 'i18n-plurals-by-cldr',
    },
  ])(
    'should report "$expected" when a rule carries out a parent its place cannot reach',
    ({ expected, parent }) => {
      // Arrange
      const files = validFiles();
      files[PORTALS] = `# Portals\n\n${rule({
        parent,
        slug: 'portals-for-overlays',
        statement: 'React DOM renders an overlay through a portal.',
      })}`;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: PORTALS,
        },
      ]);
    },
  );

  it('should report each rule of a cycle and no rule that only leads into it when parents come back around', () => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = [
      '# Principles',
      '',
      rule({
        parent: 'names-reveal-intent',
        slug: 'dependencies-point-inward',
      }),
      rule({
        parent: 'dependencies-point-inward',
        slug: 'names-reveal-intent',
      }),
    ].join('\n');
    files[UI] = `# UI\n\n${rule({
      parent: 'names-reveal-intent',
      slug: 'four-data-states',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'rule "dependencies-point-inward" carries out a chain that comes back to it: dependencies-point-inward → names-reveal-intent → dependencies-point-inward',
        path: PRINCIPLES,
      },
      {
        message:
          'rule "names-reveal-intent" carries out a chain that comes back to it: names-reveal-intent → dependencies-point-inward → names-reveal-intent',
        path: PRINCIPLES,
      },
    ]);
  });

  it.each([
    {
      child: {
        parent: 'dependencies-point-inward',
        slug: 'portals-for-overlays',
      },
      condition: 'a rule on workflow carries out a MUST rule of the base',
      parentLevel: 'MUST',
    },
    {
      child: {
        level: 'MUST',
        parent: 'dependencies-point-inward',
        slug: 'portals-for-overlays',
      },
      condition: 'a MUST rule carries out a SHOULD rule',
      parentLevel: 'SHOULD',
    },
  ])('should accept a parent when $condition in another block', ({ child, parentLevel }) => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = `# Principles\n\n${rule({
      level: parentLevel,
      slug: 'dependencies-point-inward',
    })}`;
    files[PORTALS] = `# Portals\n\n${rule(child)}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      child: {
        file: I18N,
        slug: 'i18n-plurals-by-cldr',
      },
      condition: 'a rule of the base carries out a workflow rule',
      expected:
        'rule "i18n-plurals-by-cldr" carries out "rules-bind" on workflow, which a rule on the base may not refer to',
      parent: 'rules-bind',
    },
    {
      child: {
        file: REMOTE_DATA,
        slug: 'reads-are-cancellable',
      },
      condition: 'an architecture rule carries out a workflow rule',
      expected:
        'rule "reads-are-cancellable" carries out "rules-bind" on workflow, which a rule on architecture may not refer to',
      parent: 'rules-bind',
    },
  ])('should report the reference when $condition', ({ child, expected, parent }) => {
    // Arrange
    const files = validFiles();
    files[child.file] = `# Chapter\n\n${rule({
      parent,
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
  });

  it.each([
    {
      condition: 'its parent states MUST',
      parent: rule({
        slug: 'four-data-states',
      }),
    },
    {
      condition: 'its parent takes MUST from its own parent',
      parent: rule({
        parent: 'dependencies-point-inward',
        slug: 'four-data-states',
      }),
    },
  ])('should report a rule that states a looser level when $condition', ({ parent }) => {
    // Arrange
    const files = validFiles();
    files[UI] = `# UI\n\n${parent}`;
    files[PORTALS] = `# Portals\n\n${rule({
      level: 'SHOULD',
      parent: 'four-data-states',
      slug: 'portals-for-overlays',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'rule "portals-for-overlays" is SHOULD while it carries out the MUST rule "four-data-states"; a rule is never looser than the rule it carries out',
        path: PORTALS,
      },
    ]);
  });

  it.each([
    {
      condition: 'its parent states it',
      level: 'SHOULD',
      parent: rule({
        level: 'SHOULD',
        slug: 'four-data-states',
      }),
    },
    {
      condition: 'its parent takes it from its own parent',
      level: 'MUST',
      parent: rule({
        parent: 'dependencies-point-inward',
        slug: 'four-data-states',
      }),
    },
  ])(
    'should report a rule that states the level it inherits when $condition',
    ({ level, parent }) => {
      // Arrange
      const files = validFiles();
      files[UI] = `# UI\n\n${parent}`;
      files[PORTALS] = `# Portals\n\n${rule({
        level,
        parent: 'four-data-states',
        slug: 'portals-for-overlays',
      })}`;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: `rule "portals-for-overlays" states ${level}, the level it already takes from "four-data-states"; a rule states a level only to be stricter than the rule it carries out`,
          path: PORTALS,
        },
      ]);
    },
  );

  it.each([
    {
      condition: 'in another file on another axis',
      file: WORKFLOW,
      parent: 'dependencies-point-inward',
      slug: 'rules-bind',
    },
    {
      condition: 'in its seam with another block',
      file: UI_WITH_REMOTE_DATA,
      parent: 'four-data-states',
      slug: 'optimistic-writes-roll-back',
    },
  ])(
    'should report a rule that carries out a rule of its own block when it sits $condition',
    ({ file, parent, slug }) => {
      // Arrange
      const files = validFiles();
      files[file] = `# Chapter\n\n${rule({
        parent,
        slug,
      })}`;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: `rule "${slug}" carries out "${parent}", a rule of its own block; a rule carries out only a rule of another block`,
          path: file,
        },
      ]);
    },
  );
});
