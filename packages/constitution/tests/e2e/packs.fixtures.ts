import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { cliPath } from './cli.fixtures';
import { toolEnvironment } from './package.fixtures';

type Files = Readonly<Record<string, string>>;

interface Run {
  output: string;
  passed: boolean;
}

const repository = join(import.meta.dir, '..', '..');

const created: string[] = [];

const packFilesOf = (parent: string): Files => ({
  'blocks/implementations/acme/architecture/root.md': [
    '# Root',
    '',
    '> Governs where Acme is called from.',
    '',
    '## General',
    '',
    '### acme-client-wired-by-the-root → adapter-imported-only-by-the-root · MUST',
    '',
    "Acme's client is built only by the root.",
    '',
    '| Why |',
    '|---|',
    '| the vendor then stays at the edge. |',
    '',
  ].join('\n'),
  'DECISIONS.md':
    '# Decision Log\n\n## ADR-0001 — Acme joins the pack\n**Date:** 2026-10-17 · **Status:** Accepted\n',
  'blocks/implementations/acme/acme.md': [
    '---',
    'id: acme',
    'summary: "Acme sends the shop\'s events to its analytics."',
    'requires: []',
    'extends: null',
    'abstract: false',
    'languages: []',
    'governs: ["**/acme.*"]',
    '---',
    '',
    '# Acme',
    '',
    "> Acme, the shop's analytics.",
    '',
  ].join('\n'),
  'blocks/implementations/acme/foundation/dependencies.md': [
    '# Dependencies',
    '',
    '> Governs the files that call Acme.',
    '',
    '## General',
    '',
    `### acme-reached-through-its-entry → ${parent} · MUST`,
    '',
    'Acme is reached only through its package entry.',
    '',
    '| Why |',
    '|---|',
    '| a path inside Acme is not its contract. |',
    '',
  ].join('\n'),
});

const createPack = (parent = 'dependency-reached-through-its-public-entry'): string => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-pack-')));

  created.push(folder);
  spawnSync(
    'git',
    [
      'init',
      '--quiet',
      folder,
    ],
    {
      env: toolEnvironment(),
    },
  );

  for (const [path, text] of Object.entries(packFilesOf(parent))) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  return folder;
};

const checkPack = (pack: string): Run => {
  const run = spawnSync(
    cliPath,
    [
      'check',
      '--base',
      repository,
    ],
    {
      cwd: pack,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  return {
    output: `${run.stdout}${run.stderr}`,
    passed: run.status === 0,
  };
};

const removePacks = (): void => {
  for (const folder of created.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { checkPack, createPack, removePacks };
