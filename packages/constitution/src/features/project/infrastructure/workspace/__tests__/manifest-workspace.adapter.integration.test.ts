import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createManifestWorkspace } from '../manifest-workspace.adapter';

let parent = '';
let project = '';

const writeAll = (files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(project, path)), {
      recursive: true,
    });
    writeFileSync(join(project, path), text);
  }
};

const typescriptUnits = {
  'apps/docs/package.json': '{}\n',
  'apps/notes/README.md': '# Not a package\n',
  'packages/ui/package.json': '{}\n',
  'packages/mixed/python/pyproject.toml': '[project]\nname = "mixed"\n',
  'packages/mixed/typescript/package.json': '{}\n',
};

beforeEach(() => {
  parent = mkdtempSync(join(tmpdir(), 'manifest-workspace-'));
  project = join(parent, 'project');
  mkdirSync(join(parent, 'sibling'), {
    recursive: true,
  });
  writeFileSync(join(parent, 'sibling', 'package.json'), '{}\n');
});

afterEach(() => {
  rmSync(parent, {
    force: true,
    recursive: true,
  });
});

describe('createManifestWorkspace', () => {
  it.each([
    {
      condition: 'package.json lists its globs',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["apps/*", "packages/*", "packages/mixed/*"]}\n',
      },
      members: [
        'apps/docs',
        'packages/mixed/typescript',
        'packages/ui',
      ],
    },
    {
      condition: 'package.json lists its globs under packages and leaves one out',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": {"packages": ["apps/*", "packages/*", "!packages/ui"]}}\n',
      },
      members: [
        'apps/docs',
      ],
    },
    {
      condition: "uv's workspace lists members and leaves one out",
      files: {
        ...typescriptUnits,
        'packages/check/pyproject.toml': '[project]\nname = "check"\n',
        'packages/old/pyproject.toml': '[project]\nname = "old"\n',
        'pyproject.toml':
          '[tool.uv.workspace]\nmembers = ["packages/*/python", "packages/*"]\nexclude = ["packages/old"]\n',
      },
      members: [
        'packages/check',
        'packages/mixed/python',
      ],
    },
    {
      condition: 'both manifests declare members, a glob reaches any depth and one is named twice',
      files: {
        ...typescriptUnits,
        'node_modules/typescript/package.json': '{}\n',
        'package.json': '{"workspaces": ["**/typescript", "apps/docs", "./apps/docs/"]}\n',
        'packages/.hidden/typescript/package.json': '{}\n',
        'pyproject.toml': '[tool.uv.workspace]\nmembers = ["packages/mixed/python"]\n',
      },
      members: [
        'apps/docs',
        'packages/mixed/python',
        'packages/mixed/typescript',
      ],
    },
    {
      condition: 'a glob reaches every depth, the project itself included',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["**"]}\n',
      },
      members: [
        'apps/docs',
        'packages/mixed/typescript',
        'packages/ui',
      ],
    },
    {
      condition: 'a glob closes on a slash',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["apps/docs/"]}\n',
      },
      members: [
        'apps/docs',
      ],
    },
    {
      condition: 'a glob names braces, a character class and a single character',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["{apps,packages}/[du]?*"]}\n',
      },
      members: [
        'apps/docs',
        'packages/ui',
      ],
    },
    {
      condition: 'braces hold globs of their own folders',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["{apps/docs,packages/*}"]}\n',
      },
      members: [
        'apps/docs',
        'packages/ui',
      ],
    },
    {
      condition: 'braces stand within braces, beside a comma outside them',
      files: {
        ...typescriptUnits,
        'package.json':
          '{"workspaces": ["packages/{ui,mixed/{python,typescript}}", "apps/docs,old"]}\n',
        'apps/docs,old/package.json': '{}\n',
      },
      members: [
        'apps/docs,old',
        'packages/mixed/typescript',
        'packages/ui',
      ],
    },
    {
      condition: 'a glob escapes its braces and closes one it never opened',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["packages/\\\\{ui,kit}", "apps/}{docs}"]}\n',
        'apps/}docs/package.json': '{}\n',
        'packages/{ui,kit}/package.json': '{}\n',
      },
      members: [
        'apps/}docs',
        'packages/{ui,kit}',
      ],
    },
    {
      condition: 'globs name two single characters and a dot to match as it is',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["packages/??", "packages/*.kit"]}\n',
        'packages/ui.kit/package.json': '{}\n',
        'packages/uiXkit/package.json': '{}\n',
      },
      members: [
        'packages/ui',
        'packages/ui.kit',
      ],
    },
    {
      condition: 'a glob names a single character a name beyond the basic plane holds',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["packages/?"]}\n',
        'packages/\u{1F600}/package.json': '{}\n',
      },
      members: [
        'packages/\u{1F600}',
      ],
    },
    {
      condition: 'pyproject.toml declares a project and no tool',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["apps/*"]}\n',
        'pyproject.toml': '[project]\nname = "root"\n',
      },
      members: [
        'apps/docs',
      ],
    },
    {
      condition: 'pyproject.toml holds tools but no workspace of uv',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["apps/*"]}\n',
        'pyproject.toml': '[tool.ruff]\nline-length = 100\n',
      },
      members: [
        'apps/docs',
      ],
    },
    {
      condition: "pyproject.toml holds uv's settings but no workspace",
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": ["apps/*"]}\n',
        'pyproject.toml': '[tool.uv]\nexclude-newer = "3 days"\n',
      },
      members: [
        'apps/docs',
      ],
    },
  ])(
    'should give the members, each once, in the order of their paths, when $condition',
    ({ files, members }) => {
      // Arrange
      writeAll(files);

      // Act
      const found = createManifestWorkspace({
        maxFolders: 100,
        maxGlobs: 100,
      }).membersOf(AbsolutePath.create(project));

      // Assert
      expect<readonly string[]>(found).toStrictEqual(members);
    },
  );

  it.each([
    {
      condition: 'the project keeps no manifest',
      files: typescriptUnits,
    },
    {
      condition: 'its manifests are no JSON and no TOML',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": [\n',
        'pyproject.toml': '[tool.uv.workspace\n',
      },
    },
    {
      condition: 'its manifests are of another shape',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": "apps/*"}\n',
        'pyproject.toml': '[tool.uv]\nworkspace = "packages/*"\n',
      },
    },
    {
      condition: 'its manifests list globs that are no text',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": [1]}\n',
        'pyproject.toml': '[tool.uv.workspace]\nmembers = [1]\n',
      },
    },
    {
      condition: "Yarn's form lists globs that are no text",
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": {"packages": [1]}}\n',
      },
    },
    {
      condition:
        'its globs reach the project itself, a folder above it and folders that are not there',
      files: {
        ...typescriptUnits,
        'package.json': '{"workspaces": [".", "../*", "missing/*", "apps/notes"]}\n',
      },
    },
  ])('should give no member when $condition', ({ files }) => {
    // Arrange
    writeAll(files);

    // Act
    const found = createManifestWorkspace({
      maxFolders: 100,
      maxGlobs: 100,
    }).membersOf(AbsolutePath.create(project));

    // Assert
    expect(found).toStrictEqual([]);
  });

  it('should stop listing folders at its bound when the globs reach more', () => {
    // Arrange
    writeAll({
      ...typescriptUnits,
      'package.json': '{"workspaces": ["apps/*", "packages/*"]}\n',
    });

    // Act
    const found = createManifestWorkspace({
      maxFolders: 1,
      maxGlobs: 100,
    }).membersOf(AbsolutePath.create(project));

    // Assert
    expect<readonly string[]>(found).toStrictEqual([
      'apps/docs',
    ]);
  });

  it('should list no folder above the project when a glob reaches above it', () => {
    // Arrange
    writeAll({
      ...typescriptUnits,
      'package.json': '{"workspaces": ["../*", "apps/*"]}\n',
    });

    // Act
    const found = createManifestWorkspace({
      maxFolders: 1,
      maxGlobs: 100,
    }).membersOf(AbsolutePath.create(project));

    // Assert
    expect<readonly string[]>(found).toStrictEqual([
      'apps/docs',
    ]);
  });

  it('should spell out the braces of each glob no further than its bound', () => {
    // Arrange
    writeAll({
      ...typescriptUnits,
      'package.json':
        '{"workspaces": ["{apps/docs,packages/ui}", "packages/{mixed/typescript}"]}\n',
    });

    // Act
    const found = createManifestWorkspace({
      maxFolders: 100,
      maxGlobs: 2,
    }).membersOf(AbsolutePath.create(project));

    // Assert
    expect<readonly string[]>(found).toStrictEqual([
      'apps/docs',
      'packages/mixed/typescript',
    ]);
  });
});
