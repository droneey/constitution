import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel/types';

import {
  blockFiles,
  checkInputOf,
  findingOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { presetsCheck } from '../presets.check';

const findingsOf = (paths: readonly string[]): readonly Finding[] =>
  presetsCheck(
    checkInputOf({
      ...validFiles(),
      ...blockFiles({
        body: '# CSS\n',
        dir: 'blocks/contexts/languages/css',
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
      'presets/typescript/biome/foundation/bindings.yaml',
      'presets/typescript/biome/architecture/bindings.yaml',
      'presets/typescript/biome/workflow/self.config.jsonc',
      'presets/common/biome/foundation/bindings.yaml',
      'presets/css/lingui/foundation/core.jsonc',
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    code: string;
    name: string;
    names: string[];
    path: string;
  }>([
    {
      code: 'stray-preset-file',
      name: "a part sits at its tool folder's root",
      names: [],
      path: 'presets/typescript/biome/core.jsonc',
    },
    {
      code: 'stray-preset-file',
      name: 'a part sits in a folder that is no axis',
      names: [],
      path: 'presets/typescript/biome/notes/core.jsonc',
    },
    {
      code: 'stray-preset-file',
      name: 'a part sits in a folder of an axis folder',
      names: [],
      path: 'presets/typescript/biome/architecture/nested/core.jsonc',
    },
    {
      code: 'stray-preset-file',
      name: 'a part sits in an axis folder of an axis folder',
      names: [],
      path: 'presets/typescript/biome/architecture/workflow/core.jsonc',
    },
    {
      code: 'stray-preset-file',
      name: 'a part sits in a presets folder of a tool folder',
      names: [],
      path: 'presets/typescript/biome/nested/presets/common/biome/foundation/core.jsonc',
    },
    {
      code: 'stray-preset-file',
      name: 'a part is hidden',
      names: [],
      path: 'presets/typescript/biome/foundation/.core.jsonc',
    },
    {
      code: 'stray-preset-file',
      name: 'a part has an empty extension',
      names: [],
      path: 'presets/typescript/biome/foundation/core.',
    },
    {
      code: 'stray-preset-file',
      name: 'a folder is named like a part',
      names: [],
      path: 'presets/typescript/biome/foundation/core.jsonc/notes.txt',
    },
    {
      code: 'stray-preset-file',
      name: "a plugin sits in its tool folder's root plugins folder",
      names: [],
      path: 'presets/typescript/biome/plugins/hooks-at-top-level.grit',
    },
    {
      code: 'stray-preset-file',
      name: 'a plugin sits in a folder of a tool folder',
      names: [],
      path: 'presets/typescript/biome/x/plugins/hooks-at-top-level.grit',
    },
    {
      code: 'stray-preset-file',
      name: 'a plugin sits in a folder of its plugins folder',
      names: [],
      path: 'presets/typescript/biome/foundation/plugins/nested/hooks-at-top-level.grit',
    },
    {
      code: 'stray-preset-file',
      name: 'a folder is named like a plugin',
      names: [],
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit/notes.grit',
    },
    {
      code: 'stray-preset-file',
      name: 'a GritQL file sits in a folder that is no plugins folder',
      names: [],
      path: 'presets/typescript/biome/x/hooks-at-top-level.grit',
    },
    {
      code: 'stray-preset-file',
      name: 'a plugin carries a second extension',
      names: [],
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.grit.bak',
    },
    {
      code: 'stray-preset-file',
      name: 'a plugin is hidden',
      names: [],
      path: 'presets/typescript/biome/foundation/plugins/.hooks-at-top-level.grit',
    },
    {
      code: 'stray-preset-file',
      name: 'a plugin is not GritQL',
      names: [],
      path: 'presets/typescript/biome/foundation/plugins/hooks-at-top-level.json',
    },
    {
      code: 'stray-preset-file',
      name: 'the bindings sit outside a scope folder',
      names: [],
      path: 'presets/biome/bindings.yaml',
    },
    {
      code: 'stray-preset-file',
      name: "the bindings sit at their tool folder's root",
      names: [],
      path: 'presets/typescript/biome/bindings.yaml',
    },
    {
      code: 'stray-preset-file',
      name: 'the bindings sit in a folder that is no axis',
      names: [],
      path: 'presets/typescript/biome/notes/bindings.yaml',
    },
    {
      code: 'stray-preset-file',
      name: 'the bindings sit two folders deep in an axis folder',
      names: [],
      path: 'presets/typescript/biome/architecture/nested/bindings.yaml',
    },
    {
      code: 'stray-preset-file',
      name: 'a folder is named like the bindings',
      names: [],
      path: 'presets/typescript/biome/foundation/bindings.yaml/notes.txt',
    },
    {
      code: 'part-names-no-block',
      name: 'the bindings carry a second extension',
      names: [
        'bindings',
      ],
      path: 'presets/typescript/biome/foundation/bindings.yaml.bak',
    },
    {
      code: 'preset-scope-not-covered',
      name: 'a part sits in a scope that names no block',
      names: [
        'nowhere',
        'biome',
      ],
      path: 'presets/nowhere/biome/architecture/ui.jsonc',
    },
    {
      code: 'preset-scope-not-covered',
      name: 'a part sits in a scope that is a domain, not a language',
      names: [
        'ui',
        'biome',
      ],
      path: 'presets/ui/biome/architecture/typescript.jsonc',
    },
    {
      code: 'preset-scope-not-covered',
      name: 'a part sits in a language its tool does not cover',
      names: [
        'css',
        'biome',
      ],
      path: 'presets/css/biome/foundation/core.jsonc',
    },
    {
      code: 'preset-scope-not-covered',
      name: 'the bindings sit in a language their tool does not cover',
      names: [
        'css',
        'biome',
      ],
      path: 'presets/css/biome/foundation/bindings.yaml',
    },
    {
      code: 'preset-tool-names-no-block',
      name: 'the bindings of a tool that is no block',
      names: [
        'common',
        'eslint',
      ],
      path: 'presets/common/eslint/foundation/bindings.yaml',
    },
    {
      code: 'preset-scope-not-covered',
      name: 'a part of a tool that covers any language sits in a domain',
      names: [
        'ui',
        'lingui',
      ],
      path: 'presets/ui/lingui/foundation/core.jsonc',
    },
    {
      code: 'preset-tool-names-no-block',
      name: "a language's folder holds a tool that names no block",
      names: [
        'typescript',
        'eslint',
      ],
      path: 'presets/typescript/eslint/foundation/core.mjs',
    },
    {
      code: 'part-names-no-block',
      name: 'a part is named after no block',
      names: [
        'react',
      ],
      path: 'presets/typescript/biome/foundation/react.jsonc',
    },
    {
      code: 'plugin-names-no-rule',
      name: 'a plugin is named after no rule',
      names: [
        'null-free',
      ],
      path: 'presets/typescript/biome/foundation/plugins/null-free.grit',
    },
    {
      code: 'plugin-off-axis',
      name: 'a plugin of foundation holds a rule of architecture',
      names: [
        'reads-are-cancellable',
        'architecture',
        'foundation/',
      ],
      path: 'presets/typescript/biome/foundation/plugins/reads-are-cancellable.grit',
    },
    {
      code: 'plugin-off-axis',
      name: 'a plugin of architecture holds a rule of foundation',
      names: [
        'hooks-at-top-level',
        'foundation',
        'architecture/',
      ],
      path: 'presets/typescript/biome/architecture/plugins/hooks-at-top-level.grit',
    },
  ])('should report the file when $name', ({ code, names, path }) => {
    // Arrange
    const paths = [
      path,
    ];

    // Act
    const findings = findingsOf(paths);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code,
        names,
        path,
      }),
    ]);
  });
});
