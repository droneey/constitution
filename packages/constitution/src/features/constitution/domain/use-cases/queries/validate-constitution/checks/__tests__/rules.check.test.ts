import { describe, expect, it } from 'bun:test';

import { checkInputOf, findingOf, rule } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { rulesCheck } from '../rules.check';

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
      findingOf({
        code: 'slug-not-kebab-case',
        names: [
          'not_Kebab',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'rule-without-statement',
        names: [
          'not_Kebab',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'rule-without-why',
        names: [
          'not_Kebab',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'tag-not-a-lens',
        names: [
          'not_Kebab',
          'vibes',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'tag-not-a-lens',
        names: [
          'b',
          'types',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'slug-opens-with-no',
        names: [
          'no-any-written',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'rule-without-why',
        names: [
          'c',
        ],
        path: PRINCIPLES,
      }),
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
      findingOf({
        code: 'rule-defined-twice',
        names: [
          'dependencies-point-inward',
          PRINCIPLES,
        ],
        path: WORKFLOW,
      }),
    ]);
  });

  it.each<{
    code: string;
    names: string[];
    parent: string;
  }>([
    {
      code: 'parent-out-of-reach',
      names: [
        'i18n-plurals-by-cldr',
        'four-data-states',
        'ui',
      ],
      parent: 'four-data-states',
    },
    {
      code: 'parent-chain-cycle',
      names: [
        'i18n-plurals-by-cldr → i18n-plurals-by-cldr',
      ],
      parent: 'i18n-plurals-by-cldr',
    },
    {
      code: 'parent-not-a-rule',
      names: [
        'i18n-plurals-by-cldr',
        'plurals-by-icu',
      ],
      parent: 'plurals-by-icu',
    },
  ])('should report $code when a rule carries out $parent', ({ code, names, parent }) => {
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
      findingOf({
        code,
        names,
        path: I18N,
      }),
    ]);
  });

  it.each<{
    code: string;
    names: string[];
    parent: string;
  }>([
    {
      code: 'parent-seam-out-of-reach',
      names: [
        'portals-for-overlays',
        'optimistic-writes-roll-back',
        'ui',
        'remote-data',
      ],
      parent: 'optimistic-writes-roll-back',
    },
    {
      code: 'parent-out-of-reach',
      names: [
        'portals-for-overlays',
        'i18n-plurals-by-cldr',
        'i18n',
      ],
      parent: 'i18n-plurals-by-cldr',
    },
  ])(
    'should report $code when a rule carries out a parent its place cannot reach',
    ({ code, names, parent }) => {
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
        findingOf({
          code,
          names,
          path: PORTALS,
        }),
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
      findingOf({
        code: 'parent-chain-cycle',
        names: [
          'dependencies-point-inward → names-reveal-intent → dependencies-point-inward',
        ],
        path: PRINCIPLES,
      }),
      findingOf({
        code: 'parent-chain-cycle',
        names: [
          'names-reveal-intent → dependencies-point-inward → names-reveal-intent',
        ],
        path: PRINCIPLES,
      }),
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
      names: [
        'i18n-plurals-by-cldr',
        'rules-bind',
        'workflow',
        'foundation',
      ],
      parent: 'rules-bind',
    },
    {
      child: {
        file: REMOTE_DATA,
        slug: 'reads-are-cancellable',
      },
      condition: 'an architecture rule carries out a workflow rule',
      names: [
        'reads-are-cancellable',
        'rules-bind',
        'workflow',
        'architecture',
      ],
      parent: 'rules-bind',
    },
  ])('should report the reference when $condition', ({ child, names, parent }) => {
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
      findingOf({
        code: 'parent-off-axis',
        names,
        path: child.file,
      }),
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
      findingOf({
        code: 'rule-looser-than-parent',
        names: [
          'portals-for-overlays',
          'SHOULD',
          'MUST',
          'four-data-states',
        ],
        path: PORTALS,
      }),
    ]);
  });

  it('should report a rule that carries out another without a level', () => {
    // Arrange
    const files = validFiles();
    files[PORTALS] = `# Portals\n\n${rule({
      isLevelStated: false,
      parent: 'four-data-states',
      slug: 'portals-for-overlays',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'rule-without-level',
        names: [
          'portals-for-overlays',
          'four-data-states',
        ],
        path: PORTALS,
      }),
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
        parent,
        slug,
      })}`;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'parent-in-own-block',
          names: [
            slug,
            parent,
          ],
          path: file,
        }),
      ]);
    },
  );

  it.each<{
    body: string;
    chapter: string;
    condition: string;
    file: string;
  }>([
    {
      body: `# Types\n\n## Principles\n\n${rule({
        parent: 'dependencies-point-inward',
        slug: 'types-point-inward',
      })}`,
      chapter: 'Types',
      condition:
        "of a language sits in a chapter titled for another, under a section named for its parent's",
      file: TYPES,
    },
    {
      body: `# Delivery\n\n## General\n\n${rule({
        parent: 'dependencies-point-inward',
        slug: 'delivery-points-inward',
      })}`,
      chapter: 'Delivery',
      condition: 'of a platform sits in a chapter titled for another',
      file: DELIVERY,
    },
    {
      body: rule({
        parent: 'dependencies-point-inward',
        slug: 'types-point-inward',
      }),
      chapter: 'untitled',
      condition: 'of a language sits in a file with no title',
      file: TYPES,
    },
  ])(
    'should report a rule that carries out a rule of core when it $condition',
    ({ body, chapter, file }) => {
      // Arrange
      const files = validFiles();
      files[file] = body;
      const input = checkInputOf(files);

      // Act
      const findings = rulesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'rule-outside-parent-chapter',
          names: [
            chapter,
            'dependencies-point-inward',
            'Principles',
          ],
          path: file,
        }),
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
      parent: 'bare-rule',
      slug: 'types-point-inward',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = rulesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'rule-outside-parent-chapter',
        names: [
          'types-point-inward',
          'Types',
          'bare-rule',
          'untitled',
        ],
        path: TYPES,
      }),
    ]);
  });

  it.each([
    {
      condition: "a rule of a language sits in the chapter titled like its parent's, under General",
      file: TYPES,
      body: `# Principles\n\n## General\n\n${rule({
        parent: 'dependencies-point-inward',
        slug: 'types-point-inward',
      })}`,
    },
    {
      condition:
        "a rule of a language sits in the chapter titled like its parent's, under a part of it",
      file: TYPES,
      body: `# Principles\n\n## Imports\n\n${rule({
        parent: 'dependencies-point-inward',
        slug: 'types-point-inward',
      })}`,
    },
    {
      condition: 'a rule of a seam of a language carries out a rule of core',
      file: TYPESCRIPT_WITH_BROWSER,
      body: `# Browser\n\n## General\n\n${rule({
        parent: 'dependencies-point-inward',
        slug: 'window-points-inward',
      })}`,
    },
    {
      condition: 'a rule of a platform carries out a rule of a domain',
      file: DELIVERY,
      body: `# Delivery\n\n## General\n\n${rule({
        parent: 'secret-never-held-by-the-client',
        slug: 'secret-never-delivered',
      })}`,
    },
    {
      condition: 'a rule of a domain sits in a chapter of its own',
      file: I18N,
      body: `# Plurals\n\n## Forms\n\n${rule({
        parent: 'dependencies-point-inward',
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
