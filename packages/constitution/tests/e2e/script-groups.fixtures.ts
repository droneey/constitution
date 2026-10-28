import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';

import { z } from 'zod';

import { appliedUnit, constitutionOf } from './applied-unit.fixtures';
import { cliPath } from './cli.fixtures';
import { environmentOf, searchPathWith, toolEnvironment } from './package.fixtures';

interface Ran {
  readonly exitCode: number | undefined;
  readonly output: string;
}

const EXECUTABLE = 0o755;
const LINK = '.droneey/constitution';
const WEB = 'apps/web';
const API = 'apps/api';

const manifest = z.object({
  scripts: z.record(z.string(), z.string()).optional(),
});

const shell = {
  implementations: [
    'bun',
    'shellcheck',
  ],
  languages: [
    'shell',
  ],
};

const appliedWorkspace = (): string =>
  appliedUnit({
    ...shell,
    files: {
      [`${API}/constitution.yaml`]: constitutionOf({
        implementations: [
          'betterleaks',
          'bun',
          'osv-scanner',
        ],
        name: 'api',
      }),
      [`${API}/package.json`]: '{ "name": "api" }\n',
      [`${WEB}/constitution.yaml`]: constitutionOf({
        ...shell,
        name: 'web',
      }),
      [`${WEB}/package.json`]: '{ "name": "web" }\n',
      [`${WEB}/tool.sh`]: '#!/bin/sh\necho web\n',
      'package.json': '{ "name": "root", "workspaces": ["apps/*"] }\n',
      'run.sh': '#!/bin/sh\necho root\n',
    },
    implementations: [
      ...shell.implementations,
      'betterleaks',
      'osv-scanner',
    ],
    name: 'root',
  });

const workspace = (): string => {
  const root = appliedWorkspace();

  for (const member of [
    API,
    WEB,
  ]) {
    if (!existsSync(join(root, member, LINK))) {
      mkdirSync(join(root, member, '.droneey'), {
        recursive: true,
      });
      symlinkSync(realpathSync(join(root, LINK)), join(root, member, LINK));
    }
  }

  return root;
};

const scriptsOf = (folder: string): Readonly<Record<string, string>> =>
  manifest.parse(JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8'))).scripts ?? {};

const shellFilesOf = (unit: string): readonly string[] => {
  const root = workspace();
  const stand = join(root, '.stand');
  const folder = join(root, unit);

  mkdirSync(stand, {
    recursive: true,
  });
  writeFileSync(join(stand, 'shellcheck'), '#!/bin/sh\nprintf "%s\\n" "$@"\n');
  chmodSync(join(stand, 'shellcheck'), EXECUTABLE);
  spawnSync(
    'git',
    [
      'init',
      '--quiet',
    ],
    {
      cwd: root,
      env: toolEnvironment(),
    },
  );

  const listed = spawnSync(
    'sh',
    [
      '-c',
      `${scriptsOf(folder)['check:shell']}`,
    ],
    {
      cwd: folder,
      encoding: 'utf8',
      env: environmentOf(
        new Map([
          [
            'PATH',
            searchPathWith(stand),
          ],
        ]),
      ),
    },
  );

  return listed.stdout.split('\n').filter((line) => line !== '');
};

const checkedUnits = (): readonly string[] => {
  const root = workspace();
  const stand = join(root, '.stand');
  const marks = join(stand, 'marks.txt');

  mkdirSync(stand, {
    recursive: true,
  });
  writeFileSync(marks, '');
  writeFileSync(join(stand, 'bun'), `#!/bin/sh\npwd -P >> '${marks}'\n`);
  chmodSync(join(stand, 'bun'), EXECUTABLE);
  spawnSync(
    cliPath,
    [
      'run',
      'check',
      '--plain',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      env: environmentOf(
        new Map([
          [
            'PATH',
            searchPathWith(stand),
          ],
        ]),
      ),
    },
  );

  return readFileSync(marks, 'utf8')
    .split('\n')
    .filter((line) => line !== '')
    .map((folder) => relative(realpathSync(root), folder));
};

const specsUnit = (files: Readonly<Record<string, string>> = {}): string =>
  appliedUnit({
    files: {
      'package.json': '{ "name": "unit" }\n',
      ...files,
    },
    implementations: [
      'bun',
      'bun-test',
    ],
    languages: [
      'typescript',
    ],
  });

const specsScripts = (): Readonly<Record<string, string>> => scriptsOf(specsUnit());

const testsRun = (files: Readonly<Record<string, string>>): Ran => {
  const folder = specsUnit(files);

  const ran = spawnSync(
    process.execPath,
    [
      'run',
      'test',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
      env: environmentOf(
        new Map([
          [
            'PATH',
            searchPathWith(),
          ],
        ]),
      ),
    },
  );

  return {
    exitCode: ran.status ?? undefined,
    output: `${ran.stdout}${ran.stderr}`,
  };
};

export { API, checkedUnits, scriptsOf, shellFilesOf, specsScripts, testsRun, WEB, workspace };
