import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel/types';

import { checkInputOf, mainFile } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { presetsCheck } from '../presets.check';

const LAYOUT =
  'is not a part of a preset: presets/<scope>/<tool>/<block>.<extension>, presets/<scope>/<tool>/plugins/<rule>.grit or presets/<scope>/<tool>/bindings.yaml, each also under architecture/ or workflow/ for that axis';

const findingsOf = (paths: readonly string[]): readonly Finding[] =>
  presetsCheck(
    checkInputOf({
      ...validFiles(),
      'blocks/contexts/languages/css/css.md': mainFile({
        body: '# CSS\n',
        id: 'css',
      }),
      ...Object.fromEntries(
        paths.map((path) => [
          path,
          '{}\n',
        ]),
      ),
    }),
  );

describe('presetsCheck', () => {
  it('should find nothing when every part is named after a block or self and every plugin after a rule of its axis', () => {
    // Arrange
    const paths = [
      'presets/common/biome/self.jsonc',
      'presets/typescript/biome/_react.jsonc',
      'presets/typescript/biome/plugins/hooks-at-top-level.grit',
      'presets/typescript/biome/architecture/plugins/reads-are-cancellable.grit',
      'presets/typescript/biome/architecture/ui.jsonc',
      'presets/typescript/biome/bindings.yaml',
      'presets/typescript/biome/architecture/bindings.yaml',
      'presets/typescript/biome/workflow/self.config.jsonc',
      'presets/common/biome/bindings.yaml',
      'presets/css/lingui/core.jsonc',
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      message: LAYOUT,
      name: 'a part sits in a folder that is no optional axis',
      path: 'presets/typescript/biome/foundation/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits in a folder of an axis folder',
      path: 'presets/typescript/biome/architecture/nested/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits in an axis folder of an axis folder',
      path: 'presets/typescript/biome/architecture/workflow/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits in a presets folder of a tool folder',
      path: 'presets/typescript/biome/nested/presets/common/biome/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part is hidden',
      path: 'presets/typescript/biome/.core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part has an empty extension',
      path: 'presets/typescript/biome/core.',
    },
    {
      message: LAYOUT,
      name: 'a folder is named like a part',
      path: 'presets/typescript/biome/core.jsonc/notes.txt',
    },
    {
      message: LAYOUT,
      name: 'a plugin sits in a folder of a tool folder',
      path: 'presets/typescript/biome/x/plugins/hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'a plugin sits in a folder of its plugins folder',
      path: 'presets/typescript/biome/plugins/nested/hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'a folder is named like a plugin',
      path: 'presets/typescript/biome/plugins/hooks-at-top-level.grit/notes.grit',
    },
    {
      message: LAYOUT,
      name: 'a GritQL file sits in a folder that is no plugins folder',
      path: 'presets/typescript/biome/x/hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'a plugin carries a second extension',
      path: 'presets/typescript/biome/plugins/hooks-at-top-level.grit.bak',
    },
    {
      message: LAYOUT,
      name: 'a plugin is hidden',
      path: 'presets/typescript/biome/plugins/.hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'a plugin is not GritQL',
      path: 'presets/typescript/biome/plugins/hooks-at-top-level.json',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit outside a scope folder',
      path: 'presets/biome/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit in a folder that is no optional axis',
      path: 'presets/typescript/biome/foundation/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit two folders deep in an axis folder',
      path: 'presets/typescript/biome/architecture/nested/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'a folder is named like the bindings',
      path: 'presets/typescript/biome/bindings.yaml/notes.txt',
    },
    {
      message: 'is named "bindings", which is neither a block nor self',
      name: 'the bindings carry a second extension',
      path: 'presets/typescript/biome/bindings.yaml.bak',
    },
    {
      message: 'is in presets/nowhere/, which is neither common nor a language biome covers',
      name: 'a part sits in a scope that names no block',
      path: 'presets/nowhere/biome/architecture/ui.jsonc',
    },
    {
      message: 'is in presets/ui/, which is neither common nor a language biome covers',
      name: 'a part sits in a scope that is a domain, not a language',
      path: 'presets/ui/biome/architecture/typescript.jsonc',
    },
    {
      message: 'is in presets/css/, which is neither common nor a language biome covers',
      name: 'a part sits in a language its tool does not cover',
      path: 'presets/css/biome/core.jsonc',
    },
    {
      message: 'is in presets/css/, which is neither common nor a language biome covers',
      name: 'the bindings sit in a language their tool does not cover',
      path: 'presets/css/biome/bindings.yaml',
    },
    {
      message: 'is in presets/common/eslint/, which names no block',
      name: 'the bindings of a tool that is no block',
      path: 'presets/common/eslint/bindings.yaml',
    },
    {
      message: 'is in presets/ui/, which is neither common nor a language lingui covers',
      name: 'a part of a tool that covers any language sits in a domain',
      path: 'presets/ui/lingui/core.jsonc',
    },
    {
      message: 'is in presets/typescript/eslint/, which names no block',
      name: "a language's folder holds a tool that names no block",
      path: 'presets/typescript/eslint/core.mjs',
    },
    {
      message: 'is named "react", which is neither a block nor self',
      name: 'a part is named after no block',
      path: 'presets/typescript/biome/react.jsonc',
    },
    {
      message:
        'is named "null-free", which is not a rule; a plugin is named after the rule it holds',
      name: 'a plugin is named after no rule',
      path: 'presets/typescript/biome/plugins/null-free.grit',
    },
    {
      message: 'holds reads-are-cancellable, a rule of architecture, in plugins/',
      name: 'a plugin of the base holds a rule of an optional axis',
      path: 'presets/typescript/biome/plugins/reads-are-cancellable.grit',
    },
    {
      message: 'holds hooks-at-top-level, a rule of the base, in architecture/plugins/',
      name: 'a plugin of an optional axis holds a rule of the base',
      path: 'presets/typescript/biome/architecture/plugins/hooks-at-top-level.grit',
    },
  ])('should report the file when $name', ({ message, path }) => {
    // Arrange
    const paths = [
      path,
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([
      {
        message,
        path,
      },
    ]);
  });
});
