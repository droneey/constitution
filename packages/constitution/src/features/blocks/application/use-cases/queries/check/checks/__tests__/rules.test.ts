import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import { rule } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../__tests__/check.fixtures';
import type { RulesDetails } from '../rules';
import { RulesCode, rulesCheck } from '../rules';

const PRINCIPLES = 'blocks/core/foundation/principles.md';
const WORKFLOW = 'blocks/core/workflow/workflow.md';
const I18N = 'blocks/domains/i18n/foundation/plurals.md';
const REMOTE_DATA = 'blocks/domains/remote-data/architecture/reads.md';
const UI = 'blocks/domains/ui/foundation/screens.md';
const UI_WITH_REMOTE_DATA = 'blocks/domains/ui/architecture/with/remote-data.md';
const PORTALS = 'blocks/implementations/react-dom/workflow/portals.md';
const TYPES = 'blocks/contexts/languages/typescript/foundation/types.md';
const UNTITLED = 'blocks/core/foundation/untitled.md';
const DELIVERY = 'blocks/contexts/platforms/browser/foundation/delivery.md';
const TYPESCRIPT_WITH_BROWSER = 'blocks/contexts/languages/typescript/architecture/with/browser.md';

describe('rulesCheck', () => {
  it('should report every empty or malformed field when rules break the rule format', () => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = [
      '# Principles',
      '',
      '### bare · MUST',
      '',
      '| Why |',
      '|---|',
      '|  |',
      '',
      rule({
        slug: 'no-any-written',
      }),
      rule({
        slug: 'key-no-longer-held',
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
        code: RulesCode.WithoutStatement,
        details: {
          slug: RuleSlug.create('bare'),
        },
        path: PRINCIPLES,
      },
      {
        code: RulesCode.WithoutWhy,
        details: {
          slug: RuleSlug.create('bare'),
        },
        path: PRINCIPLES,
      },
      {
        code: RulesCode.SlugOpensWithNo,
        details: {
          slug: RuleSlug.create('no-any-written'),
        },
        path: PRINCIPLES,
      },
      {
        code: RulesCode.WithoutWhy,
        details: {
          slug: RuleSlug.create('c'),
        },
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
        code: RulesCode.DefinedTwice,
        details: {
          firstFile: PRINCIPLES,
          slug: RuleSlug.create('dependencies-point-inward'),
        },
        path: WORKFLOW,
      },
    ]);
  });

  it.each<{
    finding: FindingOf<RulesDetails>;
    parent: string;
  }>([
    {
      finding: {
        code: RulesCode.ParentOutOfReach,
        details: {
          parent: RuleSlug.create('four-data-states'),
          parentBlock: BlockId.create('ui'),
          slug: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: I18N,
      },
      parent: 'four-data-states',
    },
    {
      finding: {
        code: RulesCode.ParentChainCycle,
        details: {
          cycle: [
            RuleSlug.create('i18n-plurals-by-cldr'),
            RuleSlug.create('i18n-plurals-by-cldr'),
          ],
          slug: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: I18N,
      },
      parent: 'i18n-plurals-by-cldr',
    },
    {
      finding: {
        code: RulesCode.ParentNotRule,
        details: {
          parent: RuleSlug.create('plurals-by-icu'),
          slug: RuleSlug.create('i18n-plurals-by-cldr'),
        },
        path: I18N,
      },
      parent: 'plurals-by-icu',
    },
  ])('should report $finding.code when a rule carries out $parent', ({ finding, parent }) => {
    // Arrange
    const files = validFiles();

    files[I18N] = `# i18n\n\n${rule({
      tightens: parent,
      slug: 'i18n-plurals-by-cldr',
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      finding,
    ]);
  });

  it.each<{
    finding: FindingOf<RulesDetails>;
    parent: string;
  }>([
    {
      finding: {
        code: RulesCode.ParentSeamOutOfReach,
        details: {
          parent: RuleSlug.create('optimistic-writes-roll-back'),
          parentBlock: BlockId.create('ui'),
          parentSeam: BlockId.create('remote-data'),
          slug: RuleSlug.create('portals-for-overlays'),
        },
        path: PORTALS,
      },
      parent: 'optimistic-writes-roll-back',
    },
    {
      finding: {
        code: RulesCode.ParentOutOfReach,
        details: {
          parent: RuleSlug.create('i18n-plurals-by-cldr'),
          parentBlock: BlockId.create('i18n'),
          slug: RuleSlug.create('portals-for-overlays'),
        },
        path: PORTALS,
      },
      parent: 'i18n-plurals-by-cldr',
    },
  ])(
    'should report $finding.code when a rule carries out a parent its place cannot reach',
    ({ finding, parent }) => {
      // Arrange
      const files = validFiles();

      files[PORTALS] = `# Portals\n\n${rule({
        tightens: parent,
        slug: 'portals-for-overlays',
        statement: 'React DOM renders an overlay through a portal.',
      })}`;

      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        finding,
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
        tightens: 'names-reveal-intent',
        slug: 'dependencies-point-inward',
      }),
      rule({
        tightens: 'dependencies-point-inward',
        slug: 'names-reveal-intent',
      }),
    ].join('\n');
    files[UI] = `# UI\n\n${rule({
      tightens: 'names-reveal-intent',
      slug: 'four-data-states',
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: RulesCode.ParentChainCycle,
        details: {
          cycle: [
            RuleSlug.create('dependencies-point-inward'),
            RuleSlug.create('names-reveal-intent'),
            RuleSlug.create('dependencies-point-inward'),
          ],
          slug: RuleSlug.create('dependencies-point-inward'),
        },
        path: PRINCIPLES,
      },
      {
        code: RulesCode.ParentChainCycle,
        details: {
          cycle: [
            RuleSlug.create('names-reveal-intent'),
            RuleSlug.create('dependencies-point-inward'),
            RuleSlug.create('names-reveal-intent'),
          ],
          slug: RuleSlug.create('names-reveal-intent'),
        },
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
      condition: 'a rule on workflow carries out a MUST rule of foundation',
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
      condition: 'a rule of foundation carries out a workflow rule',
      details: {
        axis: Axis.Foundation,
        parent: RuleSlug.create('rules-bind'),
        parentAxis: Axis.Workflow,
        slug: RuleSlug.create('i18n-plurals-by-cldr'),
      },
      parent: 'rules-bind',
    },
    {
      child: {
        file: REMOTE_DATA,
        slug: 'reads-are-cancellable',
      },
      condition: 'an architecture rule carries out a workflow rule',
      details: {
        axis: Axis.Architecture,
        parent: RuleSlug.create('rules-bind'),
        parentAxis: Axis.Workflow,
        slug: RuleSlug.create('reads-are-cancellable'),
      },
      parent: 'rules-bind',
    },
  ])('should report the reference when $condition', ({ child, details, parent }) => {
    // Arrange
    const files = validFiles();

    files[child.file] = `# Chapter\n\n${rule({
      tightens: parent,
      slug: child.slug,
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: RulesCode.ParentOffAxis,
        details,
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
      condition: 'its parent carries out another at MUST',
      parent: rule({
        tightens: 'dependencies-point-inward',
        slug: 'four-data-states',
      }),
    },
  ])('should report a rule that states a looser level when $condition', ({ parent }) => {
    // Arrange
    const files = validFiles();

    files[UI] = `# UI\n\n${parent}`;
    files[PORTALS] = `# Portals\n\n${rule({
      level: 'SHOULD',
      tightens: 'four-data-states',
      slug: 'portals-for-overlays',
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: RulesCode.LooserThanParent,
        details: {
          level: Level.Should,
          parent: RuleSlug.create('four-data-states'),
          parentLevel: Level.Must,
          slug: RuleSlug.create('portals-for-overlays'),
        },
        path: PORTALS,
      },
    ]);
  });

  it('should report a rule that carries out another without a level', () => {
    // Arrange
    const files = validFiles();

    files[PORTALS] = `# Portals\n\n${rule({
      isLevelStated: false,
      tightens: 'four-data-states',
      slug: 'portals-for-overlays',
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: RulesCode.WithoutLevel,
        details: {
          parent: RuleSlug.create('four-data-states'),
          slug: RuleSlug.create('portals-for-overlays'),
        },
        path: PORTALS,
      },
    ]);
  });

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
        tightens: parent,
        slug,
      })}`;

      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          code: RulesCode.ParentInOwnBlock,
          details: {
            parent: RuleSlug.create(parent),
            slug: RuleSlug.create(slug),
          },
          path: file,
        },
      ]);
    },
  );

  it.each<{
    body: string;
    condition: string;
    details: RulesDetails[RulesCode.OutsideParentChapter];
    file: string;
  }>([
    {
      body: `# Types\n\n## Principles\n\n${rule({
        tightens: 'dependencies-point-inward',
        slug: 'types-point-inward',
      })}`,
      condition:
        "of a language sits in a chapter titled for another, under a section named for its parent's",
      details: {
        chapter: 'Types',
        parent: RuleSlug.create('dependencies-point-inward'),
        parentChapter: 'Principles',
        slug: RuleSlug.create('types-point-inward'),
      },
      file: TYPES,
    },
    {
      body: `# Delivery\n\n## General\n\n${rule({
        tightens: 'dependencies-point-inward',
        slug: 'delivery-points-inward',
      })}`,
      condition: 'of a platform sits in a chapter titled for another',
      details: {
        chapter: 'Delivery',
        parent: RuleSlug.create('dependencies-point-inward'),
        parentChapter: 'Principles',
        slug: RuleSlug.create('delivery-points-inward'),
      },
      file: DELIVERY,
    },
    {
      body: rule({
        tightens: 'dependencies-point-inward',
        slug: 'types-point-inward',
      }),
      condition: 'of a language sits in a file with no title',
      details: {
        parent: RuleSlug.create('dependencies-point-inward'),
        parentChapter: 'Principles',
        slug: RuleSlug.create('types-point-inward'),
      },
      file: TYPES,
    },
  ])(
    'should report a rule that carries out a rule of core when it $condition',
    ({ body, details, file }) => {
      // Arrange
      const files = validFiles();

      files[file] = body;

      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          code: RulesCode.OutsideParentChapter,
          details,
          path: file,
        },
      ]);
    },
  );

  it('should report a rule of a language whose parent of core sits in a file with no title', () => {
    // Arrange
    const files = validFiles();

    files[UNTITLED] = rule({
      slug: 'bare-rule',
    });
    files[TYPES] = `# Types\n\n## General\n\n${rule({
      tightens: 'bare-rule',
      slug: 'types-point-inward',
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: RulesCode.OutsideParentChapter,
        details: {
          chapter: 'Types',
          parent: RuleSlug.create('bare-rule'),
          slug: RuleSlug.create('types-point-inward'),
        },
        path: TYPES,
      },
    ]);
  });

  it.each([
    {
      condition: "a rule of a language sits in the chapter titled like its parent's, under General",
      file: TYPES,
      body: `# Principles\n\n## General\n\n${rule({
        tightens: 'dependencies-point-inward',
        slug: 'types-point-inward',
      })}`,
    },
    {
      condition:
        "a rule of a language sits in the chapter titled like its parent's, under a part of it",
      file: TYPES,
      body: `# Principles\n\n## Imports\n\n${rule({
        tightens: 'dependencies-point-inward',
        slug: 'types-point-inward',
      })}`,
    },
    {
      condition: 'a rule of a seam of a language carries out a rule of core',
      file: TYPESCRIPT_WITH_BROWSER,
      body: `# Browser\n\n## General\n\n${rule({
        tightens: 'dependencies-point-inward',
        slug: 'window-points-inward',
      })}`,
    },
    {
      condition: 'a rule of a platform carries out a rule of a domain',
      file: DELIVERY,
      body: `# Delivery\n\n## General\n\n${rule({
        tightens: 'secret-never-held-by-the-client',
        slug: 'secret-never-delivered',
      })}`,
    },
    {
      condition: 'a rule of a domain sits in a chapter of its own',
      file: I18N,
      body: `# Plurals\n\n## Forms\n\n${rule({
        tightens: 'dependencies-point-inward',
        slug: 'plurals-point-inward',
      })}`,
    },
  ])('should report nothing when $condition', ({ body, file }) => {
    // Arrange
    const files = validFiles();

    files[file] = body;

    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
