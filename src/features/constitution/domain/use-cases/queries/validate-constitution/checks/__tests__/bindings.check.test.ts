import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  blockFiles,
  checkInputOf,
  mainFile,
  rule,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { bindingsCheck } from '../bindings.check';

const BINDINGS = 'presets/typescript/biome/bindings.yaml';
const HOOKS = 'blocks/implementations/_react/foundation/hooks.md';
const PART = 'presets/typescript/biome/foundation/_react.jsonc';
const UNHELD =
  'says a tool holds hooks-at-top-level (tool/lint), but no binding holds it, nor a rule that carries it out';
const HOOKS_BINDING = 'foundation:\n  _react:\n    hooks-at-top-level: [useHookAtTopLevel]\n';

const presetFiles = (): Files => ({
  [PART]: '{ "useHookAtTopLevel": "error" }\n',
});

const findingsOf = (files: Readonly<Files>): readonly Finding[] =>
  bindingsCheck(
    checkInputOf({
      ...validFiles(),
      ...files,
    }),
  );

describe('bindingsCheck', () => {
  it('should find nothing when no tool block has presets', () => {
    // Arrange
    const files = {};

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should find nothing when a binding holds a rule of its axis by a setting its part spells', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the rule when a tool with presets checks its role and nothing binds it', () => {
    // Arrange
    const files = presetFiles();

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: UNHELD,
        path: HOOKS,
      },
    ]);
  });

  it('should find nothing when the rule under it with the same check is bound', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: 'foundation:\n  _react:\n    hooks-in-components: [useHookAtTopLevel]\n',
      'blocks/implementations/_react/foundation/components.md': `# Components\n\n${rule({
        check: 'tool/lint',
        parent: 'hooks-at-top-level',
        slug: 'hooks-in-components',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the rule when the rule under it is bound but reviewed', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: 'foundation:\n  _react:\n    hooks-in-components: [useHookAtTopLevel]\n',
      'blocks/implementations/_react/foundation/components.md': `# Components\n\n${rule({
        parent: 'hooks-at-top-level',
        slug: 'hooks-in-components',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: UNHELD,
        path: HOOKS,
      },
    ]);
  });

  it('should find nothing unbound when the rule belongs to the tool block that checks its role', () => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      'blocks/implementations/biome/foundation/biome.md': `# Biome\n\n${rule({
        check: 'tool/lint',
        slug: 'biome-runs-in-the-check',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      name: 'an architecture part holds a rule of architecture',
      part: 'presets/typescript/biome/architecture/remote-data.jsonc',
      yaml: 'architecture:\n  remote-data:\n    reads-are-cancellable: [cancel]\n',
    },
    {
      name: 'a workflow part holds a rule of foundation',
      part: 'presets/typescript/biome/workflow/ui.yaml',
      yaml: 'workflow:\n  ui:\n    four-data-states: [cancel]\n',
    },
  ])('should find nothing when $name', ({ part, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}${yaml}`,
      [part]: 'cancel: on\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      message: 'binds "hooks-anywhere", which is not a rule',
      name: 'the rule does not exist',
      yaml: '    hooks-anywhere: [useHookAtTopLevel]\n',
    },
    {
      message: 'binds reads-are-cancellable, a rule of architecture, under foundation',
      name: 'the rule sits on another axis',
      yaml: '    reads-are-cancellable: [useHookAtTopLevel]\n',
    },
    {
      message: `binds four-data-states to "noUselessFragments", which ${PART} does not hold`,
      name: 'the part does not spell the setting',
      yaml: '    four-data-states: [noUselessFragments]\n',
    },
  ])('should report the binding when $name', ({ message, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}${yaml}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message,
        path: BINDINGS,
      },
    ]);
  });

  it.each([
    {
      message:
        'binds hooks-at-top-level, a rule of _react, to the part ui, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
      name: 'a domain part holds a rule of a library',
      part: 'presets/typescript/biome/foundation/ui.jsonc',
      yaml: 'foundation:\n  ui:\n    hooks-at-top-level: [useHookAtTopLevel]\n',
    },
    {
      message:
        'binds hooks-at-top-level, a rule of _react, to the part self, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
      name: "the tool's own part holds a rule of a library beside it",
      part: 'presets/typescript/biome/foundation/self.jsonc',
      yaml: 'foundation:\n  self:\n    hooks-at-top-level: [useHookAtTopLevel]\n',
    },
  ])('should report the binding when $name', ({ message, part, yaml }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: yaml,
      [part]: '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message,
        path: BINDINGS,
      },
    ]);
  });

  it.each([
    {
      axis: 'foundation',
      binding: `${HOOKS_BINDING}  browser:\n    four-data-states: [useHookAtTopLevel]\n`,
      name: 'the part of a platform holds a rule of a domain above it',
      part: 'browser',
      scope: 'typescript',
    },
    {
      axis: 'architecture',
      binding:
        'architecture:\n  remote-data:\n    optimistic-writes-roll-back: [useHookAtTopLevel]\n',
      name: 'the part of a block holds a rule of its seam with it',
      part: 'remote-data',
      scope: 'common',
    },
    {
      axis: 'foundation',
      binding: `${HOOKS_BINDING}  ui:\n    biome-runs-in-the-check: [useHookAtTopLevel]\n`,
      name: 'the part of a library holds a rule of the tool itself',
      part: 'ui',
      scope: 'typescript',
    },
    {
      axis: 'foundation',
      binding: `${HOOKS_BINDING}  i18n:\n    no-any: [useHookAtTopLevel]\n`,
      name: "a part of a language's scope holds a rule of its language",
      part: 'i18n',
      scope: 'typescript',
    },
    {
      axis: 'foundation',
      binding: 'foundation:\n  nowhere:\n    four-data-states: [useHookAtTopLevel]\n',
      name: 'a part named after no block holds a rule',
      part: 'nowhere',
      scope: 'common',
    },
  ])('should find no binding amiss when $name', ({ axis, binding, part, scope }) => {
    // Arrange
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [`presets/${scope}/biome/bindings.yaml`]: binding,
      [`presets/${scope}/biome/${axis}/${part}.jsonc`]: '{ "useHookAtTopLevel": "error" }\n',
      'blocks/implementations/biome/foundation/biome.md': `# Biome\n\n${rule({
        check: 'tool/lint',
        slug: 'biome-runs-in-the-check',
      })}`,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the binding when a part of every language holds a rule of a language', () => {
    // Arrange
    const bindings = 'presets/common/biome/bindings.yaml';
    const files = {
      ...presetFiles(),
      [BINDINGS]: HOOKS_BINDING,
      [bindings]: 'foundation:\n  i18n:\n    no-any: [useHookAtTopLevel]\n',
      'presets/common/biome/foundation/i18n.jsonc': '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'binds no-any, a rule of typescript, to the part i18n, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool',
        path: bindings,
      },
    ]);
  });

  it('should report the part as missing when only a stray file, a plugin, another axis, another scope or another tool holds a file of its name', () => {
    // Arrange
    const setting = '{ "useHookAtTopLevel": "error" }\n';
    const files = {
      ...presetFiles(),
      [BINDINGS]: `${HOOKS_BINDING}  ui:\n    four-data-states: [useHookAtTopLevel]\n`,
      'presets/common/biome/foundation/ui.jsonc': setting,
      'presets/typescript/biome/architecture/ui.jsonc': setting,
      'presets/typescript/biome/foundation/plugins/ui.grit': setting,
      'presets/typescript/biome/stray.txt': setting,
      'presets/typescript/eslint/foundation/ui.jsonc': setting,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'binds four-data-states to the part ui, which presets/typescript/biome/foundation/ does not hold',
        path: BINDINGS,
      },
    ]);
  });
});

const NAMES = 'blocks/domains/ui/foundation/names.md';
const PYTHON = 'blocks/contexts/languages/python/foundation/python.md';
const UNHELD_IN_PYTHON =
  'says a tool holds screens-named-by-route (tool/lint), but nothing holds it in python, which holds other rules of ui for that role';

// ui's two lint rules, both bound for TypeScript and the second for Python too.
const languageFiles = (): Files => ({
  ...presetFiles(),
  [BINDINGS]: `${HOOKS_BINDING}  ui:\n    screens-named-by-route: [useHookAtTopLevel]\n    pieces-named-by-role: [useHookAtTopLevel]\n`,
  [NAMES]: `# Names\n\n${rule({
    check: 'tool/lint',
    slug: 'screens-named-by-route',
  })}${rule({
    check: 'tool/lint',
    slug: 'pieces-named-by-role',
  })}`,
  'blocks/contexts/languages/python/python.md': mainFile({
    body: '# Python\n',
    id: 'python',
    roles: [
      'lint',
      'types',
    ],
  }),
  'blocks/implementations/ruff/ruff.md': mainFile({
    body: '# Ruff\n',
    checks: [
      'lint',
      'types',
    ],
    id: 'ruff',
    languages: [
      'python',
    ],
    requires: [
      'python',
    ],
  }),
  'presets/python/ruff/bindings.yaml': 'foundation:\n  ui:\n    pieces-named-by-role: [N802]\n',
  'presets/python/ruff/foundation/ui.toml': 'select = ["N802"]\n',
  'presets/typescript/biome/foundation/ui.jsonc': '{ "useHookAtTopLevel": "error" }\n',
});

describe('bindingsCheck in each language', () => {
  it('should report the rule in a language whose parts hold another rule of its block for that role but not it', () => {
    // Arrange
    const files = languageFiles();

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: UNHELD_IN_PYTHON,
        path: NAMES,
      },
    ]);
  });

  it.each([
    {
      condition: "a part of the language's scope binds it",
      files: {
        'presets/python/ruff/bindings.yaml':
          'foundation:\n  ui:\n    pieces-named-by-role: [N802]\n    screens-named-by-route: [N802]\n',
      },
    },
    {
      condition: 'a part of every language binds it',
      files: {
        'presets/common/ruff/bindings.yaml':
          'foundation:\n  ui:\n    screens-named-by-route: [N802]\n',
        'presets/common/ruff/foundation/ui.toml': 'select = ["N802"]\n',
      },
    },
    {
      condition: "an import contract of the language's template is named after it",
      files: {
        'templates/project/python/pyproject.toml':
          '[tool.importlinter]\n\n[[tool.importlinter.contracts]]\nname = "screens-named-by-route"\ntype = "forbidden"\n',
      },
    },
    {
      condition: 'a reviewed rule of the language carries it out',
      files: {
        [PYTHON]: `# Python\n\n${rule({
          parent: 'screens-named-by-route',
          slug: 'screens-named-by-route-in-python',
        })}`,
      },
    },
    {
      condition: 'a rule under it is held in the language by a tool of another role',
      files: {
        [PYTHON]: `# Python\n\n${rule({
          check: 'tool/types',
          parent: 'screens-named-by-route',
          slug: 'screens-typed-by-route',
        })}`,
        'presets/python/ruff/bindings.yaml':
          'foundation:\n  ui:\n    pieces-named-by-role: [N802]\n  python:\n    screens-typed-by-route: [N802]\n',
        'presets/python/ruff/foundation/python.toml': 'select = ["N802"]\n',
      },
    },
    {
      condition: "the language's parts hold only a rule of its block for another role",
      files: {
        [NAMES]: `# Names\n\n${rule({
          check: 'tool/lint',
          slug: 'screens-named-by-route',
        })}${rule({
          check: 'tool/types',
          slug: 'pieces-named-by-role',
        })}`,
      },
    },
  ])('should find nothing when $condition', ({ files }) => {
    // Arrange
    const changed = {
      ...languageFiles(),
      ...files,
    };

    // Act
    const findings = findingsOf(changed);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      condition: 'only a reviewed rule of no language carries it out',
      files: {
        'blocks/domains/ui/foundation/screens.md': `# Screens\n\n${rule({
          parent: 'screens-named-by-route',
          slug: 'screens-named-in-any-language',
        })}`,
      },
    },
    {
      condition: "only another language's template names a contract after it",
      files: {
        'templates/project/typescript/pyproject.toml':
          '[[tool.importlinter.contracts]]\nname = "screens-named-by-route"\n',
      },
    },
    {
      condition: "only the project's own name in the language's template spells it",
      files: {
        'templates/project/python/pyproject.toml': '[project]\nname = "screens-named-by-route"\n',
      },
    },
    {
      condition: "only a rule of another language's tool under it is held, by that tool's own run",
      files: {
        'blocks/implementations/biome/foundation/biome.md': `# Biome\n\n${rule({
          check: 'tool/lint',
          parent: 'screens-named-by-route',
          slug: 'screens-linted-by-biome',
        })}`,
      },
    },
    {
      condition: "a template of a block that is no language names another rule's contract",
      files: {
        'templates/project/ui/pyproject.toml':
          '[[tool.importlinter.contracts]]\nname = "pieces-named-by-role"\n',
      },
    },
  ])('should report the rule in the language when $condition', ({ files }) => {
    // Arrange
    const changed = {
      ...languageFiles(),
      ...files,
    };

    // Act
    const findings = findingsOf(changed);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: UNHELD_IN_PYTHON,
        path: NAMES,
      },
    ]);
  });

  it("should report a language's rule when only another language's part binds it", () => {
    // Arrange
    const files = {
      ...languageFiles(),
      [BINDINGS]: `${HOOKS_BINDING}  ui:\n    screens-named-by-route: [useHookAtTopLevel]\n    pieces-named-by-role: [useHookAtTopLevel]\n  python:\n    python-names-checked: [useHookAtTopLevel]\n`,
      [PYTHON]: `# Python\n\n${rule({
        check: 'tool/lint',
        slug: 'python-names-checked',
      })}`,
      'presets/python/ruff/bindings.yaml':
        'foundation:\n  ui:\n    pieces-named-by-role: [N802]\n    screens-named-by-route: [N802]\n',
      'presets/typescript/biome/foundation/python.jsonc': '{ "useHookAtTopLevel": "error" }\n',
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'says a tool holds python-names-checked (tool/lint), but nothing holds it in python',
        path: PYTHON,
      },
    ]);
  });

  it.each([
    {
      binding: {
        [BINDINGS]: `${HOOKS_BINDING}  ui:\n    screens-named-by-route: [useHookAtTopLevel]\n    pieces-named-by-role: [useHookAtTopLevel]\n  polyglot:\n    polyglot-linted: [useHookAtTopLevel]\n`,
        'presets/typescript/biome/foundation/polyglot.jsonc': '{ "useHookAtTopLevel": "error" }\n',
      },
      findings: [],
      name: 'one of its languages binds it',
    },
    {
      binding: {
        'presets/css/biome/bindings.yaml':
          'foundation:\n  polyglot:\n    polyglot-linted: [useHookAtTopLevel]\n',
        'presets/css/biome/foundation/polyglot.jsonc': '{ "useHookAtTopLevel": "error" }\n',
      },
      findings: [
        {
          message:
            'says a tool holds polyglot-linted (tool/lint), but nothing holds it in python or typescript',
          path: 'blocks/implementations/polyglot/foundation/polyglot.md',
        },
      ],
      name: 'only a scope of none of its languages binds it',
    },
  ])(
    'should report a rule of two languages $findings.length times when $name',
    ({ binding, findings }) => {
      // Arrange
      const files = {
        ...languageFiles(),
        ...blockFiles({
          dir: 'blocks/implementations/polyglot',
          files: {
            'foundation/polyglot.md': `# Polyglot\n\n${rule({
              check: 'tool/lint',
              slug: 'polyglot-linted',
            })}`,
          },
          id: 'polyglot',
          requires: [
            'python',
            'typescript',
          ],
        }),
        'presets/python/ruff/bindings.yaml':
          'foundation:\n  ui:\n    pieces-named-by-role: [N802]\n    screens-named-by-route: [N802]\n',
        ...binding,
      };

      // Act
      const found = findingsOf(files);

      // Assert
      expect(found).toStrictEqual(findings);
    },
  );
});
