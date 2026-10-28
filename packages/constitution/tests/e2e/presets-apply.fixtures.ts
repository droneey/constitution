import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { parse } from 'jsonc-parser';

import { cliPath } from './cli.fixtures';
import type { Files } from './constitution.fixtures';
import { environmentOf } from './package.fixtures';
import { createPluginRoot, distributionOf, linkDistribution } from './plugin-root.fixtures';
import type { ProjectLayout } from './project.fixtures';
import { createProject } from './project.fixtures';

interface Applied {
  readonly exitCode: number | undefined;
  /** each file the case reads, as it stands after the run; undefined where it is absent */
  readonly files: Readonly<Record<string, string | undefined>>;
}

interface ApplyInput {
  readonly project: string;
  readonly read: readonly string[];
}

const linesOf = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

// The release's preset files: markdownlint's own settings and ignore file, and a setting the ui
// domain's rule adds where a unit follows both.
const releasePresetFiles: Files = {
  'presets/markdownlint/foundation.yaml': linesOf(
    'markdownlint:',
    "  '*':",
    "    '*':",
    '      .markdownlint.jsonc:',
    '        default: true',
    '        heading:',
    '          style: atx',
    '      .markdownlintignore: !default',
    '        - node_modules/',
  ),
  'presets/markdownlint/foundation/with/ui.yaml': linesOf(
    'ui:',
    '  four-data-states:',
    "    '*':",
    '      .markdownlint.jsonc:',
    '        html: false',
  ),
};

const MEMBER = 'packages/lib';

// A member's own pack: a tool no release block names, and the preset file that writes its file.
const memberPackFiles: Files = {
  [`${MEMBER}/pack/blocks/implementations/own-tool/own-tool.md`]: linesOf(
    '---',
    'id: own-tool',
    "summary: The package's own tool.",
    'requires: []',
    'extends: null',
    'abstract: false',
    'languages: []',
    'governs: []',
    '---',
    '',
    '# own-tool',
  ),
  [`${MEMBER}/pack/presets/own-tool/foundation.yaml`]: linesOf(
    'own-tool:',
    "  '*':",
    "    '*':",
    '      own-tool.json:',
    '        strict: true',
  ),
};

interface FilesPlace {
  readonly files: Files;
  readonly folder: string;
}

const writeFiles = (input: FilesPlace): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folder, path)), {
      recursive: true,
    });
    writeFileSync(join(input.folder, path), text);
  }
};

const createPluginRootWithPresets = (): string => {
  const root = createPluginRoot();

  writeFiles({
    files: releasePresetFiles,
    folder: distributionOf(root),
  });

  return root;
};

interface LinkedProjectInput {
  readonly layout: ProjectLayout;
  /** the plugin root whose distribution the project links */
  readonly root: string;
}

const createLinkedProject = (input: LinkedProjectInput): string => {
  const project = createProject(input.layout);

  linkDistribution({
    distribution: distributionOf(input.root),
    project,
  });

  return project;
};

// A run as a pipeline runs the executable, from the project's folder with a clean environment.
const applyIn = (input: ApplyInput): Applied => {
  const ran = spawnSync(
    cliPath,
    [
      'presets',
      'apply',
    ],
    {
      cwd: input.project,
      encoding: 'utf8',
      env: environmentOf(
        new Map([
          [
            'PATH',
            '/usr/bin:/bin',
          ],
        ]),
      ),
    },
  );

  return {
    exitCode: ran.status ?? undefined,
    files: Object.fromEntries(
      input.read.map((path) => [
        path,
        existsSync(join(input.project, path))
          ? readFileSync(join(input.project, path), 'utf8')
          : undefined,
      ]),
    ),
  };
};

const settingsOf = (text: string | undefined): unknown => parse(text ?? '');

export {
  applyIn,
  createLinkedProject,
  createPluginRootWithPresets,
  linesOf,
  MEMBER,
  memberPackFiles,
  settingsOf,
};
