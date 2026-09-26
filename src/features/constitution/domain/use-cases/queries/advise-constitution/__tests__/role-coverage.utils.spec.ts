import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
  rule,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { roleCoverage } from '../role-coverage.utils';

const UI = 'blocks/domains/ui/ui.md';
const BIOME = 'blocks/implementations/biome/biome.md';
const I18N = 'blocks/domains/i18n/i18n.md';
const TYPESCRIPT = 'blocks/contexts/languages/typescript/typescript.md';
const PYTHON = 'blocks/contexts/languages/python/python.md';

// A second language no tool is built for: the lint rule of _react holds for
// every language, so python has no tool for lint.
const PYTHON_FILE = mainFile({
  body: '# Python\n',
  id: 'python',
  kind: 'context',
});

const CSS_FILE = mainFile({
  body: '# CSS\n',
  id: 'css',
  kind: 'context',
});

const prettierFile = (checks: readonly string[]): string =>
  mainFile({
    body: '# Prettier\n',
    checks,
    id: 'prettier',
    kind: 'implementation',
    requires: [
      'typescript',
      'css',
    ],
  });

describe('roleCoverage', () => {
  it('should find every role held when each tool-checked MUST rule has a tool for the language', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([]);
  });

  it('should name the roles no tool checks for a language when MUST rules need them', () => {
    // Arrange
    const files = validFiles();
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${rule({
      check: 'tool — architecture',
      slug: 'screens-import-inward',
    })}\n${rule({
      check: 'tool — coverage',
      level: 'SHOULD',
      slug: 'screens-are-covered',
    })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: typescript has no tool for architecture',
    ]);
  });

  it('should name each missing role once, in rule order, when several MUST rules need roles no tool checks', () => {
    // Arrange
    const files = validFiles();
    files[I18N] = `${textOf({
      files,
      path: I18N,
    })}\n${rule({
      check: 'tool — unused',
      slug: 'no-unused-message',
    })}`;
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${rule({
      check: 'tool — architecture',
      slug: 'screens-import-inward',
    })}\n${rule({
      check: 'tool — unused',
      slug: 'no-unused-screen',
    })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: typescript has no tool for unused, architecture',
    ]);
  });

  it('should give each language its own line, in block order, when two languages miss different roles', () => {
    // Arrange
    const files = validFiles();
    files[PYTHON] = PYTHON_FILE;
    files[TYPESCRIPT] = `${textOf({
      files,
      path: TYPESCRIPT,
    })}\n${rule({
      check: 'tool — architecture',
      slug: 'imports-point-inward',
    })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: python has no tool for lint',
      'role coverage: typescript has no tool for architecture',
    ]);
  });

  it.each([
    {
      check: 'tool — architecture',
      level: 'SHOULD',
      name: 'a SHOULD rule is tool-checked',
    },
    {
      check: 'tool — architecture',
      level: 'MAY',
      name: 'a MAY rule is tool-checked',
    },
    {
      check: 'tool — linting',
      level: 'MUST',
      name: 'a MUST rule names an unknown role',
    },
  ])('should ask for no tool when $name', ({ check, level }) => {
    // Arrange
    const files = validFiles();
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${rule({
      check,
      level,
      slug: 'screens-import-inward',
    })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([]);
  });

  it('should apply a with/ rule only to the language of the block it is named after when its own block has none', () => {
    // Arrange
    const files = validFiles();
    files[PYTHON] = PYTHON_FILE;
    files['blocks/contexts/platforms/browser/with/typescript.md'] =
      `# Seam\n\n${rule({
        check: 'tool — architecture',
        slug: 'imports-point-inward',
      })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: python has no tool for lint',
      'role coverage: typescript has no tool for architecture',
    ]);
  });

  it('should count the roles of a tool only for the languages in its closure when a second language needs them', () => {
    // Arrange
    const files = validFiles();
    files[PYTHON] = PYTHON_FILE;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: python has no tool for lint',
    ]);
  });

  it.each([
    {
      role: 'names',
    },
    {
      role: 'secrets',
    },
  ])(
    'should count a tool with no language only for $role, in every language, when it checks $role and lint',
    ({ role }) => {
      // Arrange
      const files = validFiles();
      files[BIOME] = mainFile({
        body: '# Biome\n',
        checks: [
          'lint',
          role,
        ],
        id: 'biome',
        kind: 'implementation',
      });
      files[PYTHON] = PYTHON_FILE;
      files[UI] = `${textOf({
        files,
        path: UI,
      })}\n${rule({
        check: `tool — ${role}`,
        slug: 'files-are-scanned',
      })}`;
      const input = checkInputOf(files);

      // Act
      const advice = roleCoverage(input);

      // Assert
      expect(advice).toStrictEqual([
        'role coverage: python has no tool for lint',
        'role coverage: typescript has no tool for lint',
      ]);
    },
  );

  it('should hold a role for every language a tool spans when the tool checks that role', () => {
    // Arrange
    const files = validFiles();
    files['blocks/contexts/languages/css/css.md'] = CSS_FILE;
    files['blocks/implementations/prettier/prettier.md'] = prettierFile([
      'architecture',
    ]);
    files[UI] = `${textOf({
      files,
      path: UI,
    })}\n${rule({
      check: 'tool — architecture',
      slug: 'screens-import-inward',
    })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: css has no tool for lint',
    ]);
  });

  it('should need a role for every language a with/ rule spans when none of them holds it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/contexts/languages/css/css.md'] = CSS_FILE;
    files['blocks/implementations/prettier/prettier.md'] = prettierFile([
      'lint',
    ]);
    files['blocks/contexts/languages/typescript/with/css.md'] =
      `# Seam\n\n${rule({
        check: 'tool — architecture',
        slug: 'imports-point-inward',
      })}`;
    const input = checkInputOf(files);

    // Act
    const advice = roleCoverage(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: css has no tool for architecture',
      'role coverage: typescript has no tool for architecture',
    ]);
  });
});
