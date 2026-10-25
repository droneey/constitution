import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { checkInputOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { TemplatesDetails } from '../templates';
import { TemplatesCode, templatesCheck } from '../templates';

type TemplatesFinding = FindingOf<TemplatesDetails>;

const TAKES_PARTS = '{ "extends": ["<parts>"] }\n';
const FRAGMENT = '# typescript: dependencies\n**/node_modules/\n';

const findingsOf = (files: Files): readonly TemplatesFinding[] =>
  templatesCheck(
    checkInputOf({
      ...validFiles(),
      ...files,
    }),
  );

describe('templatesCheck', () => {
  it("should find nothing when every tool with parts has a template that takes them and every template is its block's", () => {
    // Arrange
    const files = {
      'presets/common/biome/foundation/self.jsonc': '{}\n',
      'presets/typescript/biome/foundation/core.jsonc': '{}\n',
      'presets/typescript/biome/foundation/bindings.yaml': 'core: {}\n',
      'presets/typescript/lingui/architecture/plugins/hooks-at-top-level.grit': 'language js\n',
      'presets/typescript/react-dom/core.jsonc': '{}\n',
      'presets/typescript/lingui/foundation/self.mjs': 'export default {};\n',
      'templates/project/common/biome/biome.json': TAKES_PARTS,
      'templates/project/typescript/biome/biome.json': TAKES_PARTS,
      'templates/project/typescript/typescript/.gitignore': FRAGMENT,
      'templates/project/typescript/lingui/lingui.json': TAKES_PARTS,
    };

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    files: Files;
    finding: TemplatesFinding;
    name: string;
  }>([
    {
      files: {
        'presets/typescript/biome/foundation/core.jsonc': '{}\n',
      },
      finding: {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
        path: 'presets/typescript/biome/',
      },
      name: 'a tool has parts and no template',
    },
    {
      files: {
        'presets/typescript/biome/foundation/core.jsonc': '{}\n',
        'templates/project/typescript/biome/biome.json': '{}\n',
      },
      finding: {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
        path: 'presets/typescript/biome/',
      },
      name: "a tool's template does not take its parts",
    },
    {
      files: {
        'presets/typescript/biome/foundation/core.jsonc': '{}\n',
        'templates/project/common/biome/biome.json': TAKES_PARTS,
      },
      finding: {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
        path: 'presets/typescript/biome/',
      },
      name: "a tool's template sits in another scope than its parts",
    },
    {
      files: {
        'templates/project/common/nowhere/notes.txt': FRAGMENT,
      },
      finding: {
        code: TemplatesCode.NamesNoBlock,
        details: {
          scope: 'common',
          tool: 'nowhere',
        },
        path: 'templates/project/common/nowhere/notes.txt',
      },
      name: 'a template folder names no block',
    },
    {
      files: {
        'templates/project/nowhere/biome/biome.json': FRAGMENT,
      },
      finding: {
        code: TemplatesCode.ScopeNotCovered,
        details: {
          scope: 'nowhere',
        },
        path: 'templates/project/nowhere/biome/biome.json',
      },
      name: 'a template sits in a scope that names no block',
    },
    {
      files: {
        'templates/project/biome/lingui/notes.txt': FRAGMENT,
      },
      finding: {
        code: TemplatesCode.ScopeNotCovered,
        details: {
          scope: 'biome',
        },
        path: 'templates/project/biome/lingui/notes.txt',
      },
      name: 'a template sits in a scope that is no language',
    },
    {
      files: {
        'templates/project/common/notes.txt': FRAGMENT,
      },
      finding: {
        code: TemplatesCode.StrayFile,
        details: {},
        path: 'templates/project/common/notes.txt',
      },
      name: 'a template sits in no block folder',
    },
    {
      files: {
        'templates/project/notes.txt': FRAGMENT,
      },
      finding: {
        code: TemplatesCode.StrayFile,
        details: {},
        path: 'templates/project/notes.txt',
      },
      name: 'a template sits in no scope folder',
    },
  ])('should report $finding.code when $name', ({ files, finding }) => {
    // Arrange
    const expected = [
      finding,
    ];

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it("should report the tool and the folder when a tool's template sits in a folder its id only begins", () => {
    // Arrange
    const files = {
      'presets/typescript/biome/foundation/core.jsonc': '{}\n',
      'templates/project/typescript/biome-kit/biome.json': TAKES_PARTS,
    };
    const expected: readonly TemplatesFinding[] = [
      {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
        path: 'presets/typescript/biome/',
      },
      {
        code: TemplatesCode.NamesNoBlock,
        details: {
          scope: 'typescript',
          tool: 'biome-kit',
        },
        path: 'templates/project/typescript/biome-kit/biome.json',
      },
    ];

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it('should report the tool and the stray file when the only file that takes parts sits in no block folder', () => {
    // Arrange
    const files = {
      'presets/typescript/biome/foundation/core.jsonc': '{}\n',
      'templates/project/notes.txt': TAKES_PARTS,
    };
    const expected: readonly TemplatesFinding[] = [
      {
        code: TemplatesCode.ToolWithoutTemplate,
        details: {
          scope: 'typescript',
          tool: 'biome',
        },
        path: 'presets/typescript/biome/',
      },
      {
        code: TemplatesCode.StrayFile,
        details: {},
        path: 'templates/project/notes.txt',
      },
    ];

    // Act
    const findings = findingsOf(files);

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});
