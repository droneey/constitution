import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import { checkInputOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { presetsCheck } from '../presets.check';

const LAYOUT =
  'is not a part of a preset: presets/<tool>/<axis>/<block>.<extension>, presets/<tool>/<axis>/plugins/<rule>.grit, or presets/<tool>/bindings.yaml';

const findingsOf = (paths: readonly string[]): readonly Finding[] =>
  presetsCheck(
    checkInputOf({
      ...validFiles(),
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
      'presets/biome/foundation/self.jsonc',
      'presets/biome/foundation/_react.jsonc',
      'presets/biome/foundation/plugins/hooks-at-top-level.grit',
      'presets/biome/architecture/plugins/reads-are-cancellable.grit',
      'presets/biome/bindings.yaml',
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
      path: 'presets/biome/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a part sits in a folder of an axis folder',
      path: 'presets/biome/foundation/nested/presets/biome/foundation/core.jsonc',
    },
    {
      message: LAYOUT,
      name: 'a folder is named like a part',
      path: 'presets/biome/foundation/core.jsonc/notes.txt',
    },
    {
      message: LAYOUT,
      name: 'a plugin sits in a folder of an axis folder',
      path: 'presets/biome/foundation/x/presets/biome/foundation/plugins/hooks-at-top-level.grit',
    },
    {
      message: LAYOUT,
      name: 'a plugin carries a second extension',
      path: 'presets/biome/foundation/plugins/hooks-at-top-level.grit.bak',
    },
    {
      message: LAYOUT,
      name: 'a plugin is not GritQL',
      path: 'presets/biome/foundation/plugins/hooks-at-top-level.json',
    },
    {
      message: 'is in presets/eslint/, which names no block',
      name: 'the bindings of a tool that is no block',
      path: 'presets/eslint/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit in a nested presets folder',
      path: 'presets/biome/foundation/presets/biome/bindings.yaml',
    },
    {
      message: LAYOUT,
      name: 'the bindings carry a second extension',
      path: 'presets/biome/bindings.yaml.bak',
    },
    {
      message: LAYOUT,
      name: 'the bindings sit in an axis folder',
      path: 'presets/biome/foundation/nested/bindings.yaml',
    },
    {
      message: 'is in presets/eslint/, which names no block',
      name: 'the tool folder names no block',
      path: 'presets/eslint/foundation/core.mjs',
    },
    {
      message:
        'is in base/, which is not an axis: foundation, architecture, workflow',
      name: 'the axis folder is no axis',
      path: 'presets/biome/base/core.jsonc',
    },
    {
      message: 'is named "react", which is neither a block nor self',
      name: 'a part is named after no block',
      path: 'presets/biome/foundation/react.jsonc',
    },
    {
      message:
        'is named "null-free", which is not a rule; a plugin is named after the rule it holds',
      name: 'a plugin is named after no rule',
      path: 'presets/biome/foundation/plugins/null-free.grit',
    },
    {
      message:
        'holds reads-are-cancellable, a rule of architecture, in foundation/plugins',
      name: 'a plugin sits on another axis than its rule',
      path: 'presets/biome/foundation/plugins/reads-are-cancellable.grit',
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
