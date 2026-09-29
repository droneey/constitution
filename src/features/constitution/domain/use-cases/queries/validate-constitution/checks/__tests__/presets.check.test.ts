import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import {
  checkInputOf,
  mainFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { presetsCheck } from '../presets.check';

const LAYOUT =
  'is not a part of a preset: presets/<scope>/<tool>/<axis>/<block>.<extension>, presets/<scope>/<tool>/<axis>/plugins/<rule>.grit, or presets/<scope>/<tool>/bindings.yaml';

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
      'presets/common/biome/foundation/self.jsonc',
      'presets/typescript/biome/foundation/_react.jsonc',
      'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit',
      'presets/typescript/biome/architecture/plugins/reads-are-cancellable.grit',
      'presets/typescript/biome/architecture/ui.jsonc',
      'presets/typescript/biome/bindings.yaml',
      'presets/common/biome/bindings.yaml',
      'presets/css/lingui/foundation/core.jsonc',
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      message: LAYOUT,
      name: 'a part sits outside an axis folder',
      path: 'presets/typescript/biome/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits outside a scope folder',
      path: 'presets/biome/foundation/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits in a folder of an axis folder',
      path: 'presets/typescript/biome/foundation/nested/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits in a presets folder of an axis folder',
      path: 'presets/typescript/biome/foundation/nested/presets/common/biome/foundation/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a plugin sits in a presets folder of an axis folder',
      path: 'presets/typescript/biome/foundation/x/presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit in a presets folder of an axis folder',
      path: 'presets/typescript/biome/foundation/presets/common/biome/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'a folder is named like a part',
      path: 'presets/typescript/biome/foundation/core.jsonc/notes.txt',
    },
    {
      message: LAYOUT,
      name: 'a plugin sits in a folder of an axis folder',
      path: 'presets/typescript/biome/foundation/x/plugins/hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'a plugin carries a second extension',
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit.bak',
    },
    {
      message: LAYOUT,
      name: 'a plugin is not GritQL',
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.json',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit outside a scope folder',
      path: 'presets/biome/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'the bindings carry a second extension',
      path: 'presets/typescript/biome/bindings.yaml.bak',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit two folders deep in an axis folder',
      path: 'presets/typescript/biome/foundation/nested/bindings.yaml',
    },
    {
      message:
        'is in presets/nowhere/, which is neither common nor a language biome covers',
      name: 'a part sits in a scope that names no block',
      path: 'presets/nowhere/biome/architecture/ui.jsonc',
    },
    {
      message:
        'is in presets/ui/, which is neither common nor a language biome covers',
      name: 'a part sits in a scope that is a domain, not a language',
      path: 'presets/ui/biome/architecture/typescript.jsonc',
    },
    {
      message:
        'is in presets/css/, which is neither common nor a language biome covers',
      name: 'a part sits in a language its tool does not cover',
      path: 'presets/css/biome/foundation/core.jsonc',
    },
    {
      message:
        'is in presets/css/, which is neither common nor a language biome covers',
      name: 'the bindings sit in a language their tool does not cover',
      path: 'presets/css/biome/bindings.yaml',
    },
    {
      message: 'is in presets/common/eslint/, which names no block',
      name: 'the bindings of a tool that is no block',
      path: 'presets/common/eslint/bindings.yaml',
    },
    {
      message:
        'is in presets/ui/, which is neither common nor a language lingui covers',
      name: 'a part of a tool that covers any language sits in a domain',
      path: 'presets/ui/lingui/foundation/core.jsonc',
    },
    {
      message: 'is in presets/typescript/eslint/, which names no block',
      name: "a language's folder holds a tool that names no block",
      path: 'presets/typescript/eslint/foundation/core.mjs',
    },
    {
      message: 'is in presets/common/eslint/, which names no block',
      name: 'the tool folder names no block',
      path: 'presets/common/eslint/foundation/core.mjs',
    },
    {
      message:
        'is in base/, which is not an axis: foundation, architecture, workflow',
      name: 'the axis folder is no axis',
      path: 'presets/typescript/biome/base/core.jsonc',
    },
    {
      message: 'is named "react", which is neither a block nor self',
      name: 'a part is named after no block',
      path: 'presets/typescript/biome/foundation/react.jsonc',
    },
    {
      message:
        'is named "null-free", which is not a rule; a plugin is named after the rule it holds',
      name: 'a plugin is named after no rule',
      path: 'presets/typescript/biome/foundation/plugins/null-free.grit',
    },
    {
      message:
        'holds reads-are-cancellable, a rule of architecture, in foundation/plugins',
      name: 'a plugin sits on another axis than its rule',
      path: 'presets/typescript/biome/foundation/plugins/reads-are-cancellable.grit',
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
