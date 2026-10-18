import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

type Files = Readonly<Record<string, string>>;

interface Run {
  output: string;
  passed: boolean;
}

const REPOSITORY = join(import.meta.dir, '..', '..');

const created: string[] = [];

// A pack of one implementation whose rule carries out a rule of the base's core,
// in a repository of its own, with the chapter of its architecture axis.
const packFilesOf = (parent: string): Files => ({
  'blocks/implementations/acme/architecture/acme.md': [
    '# Acme',
    '',
    '> Governs where Acme is called from.',
    '',
    '### acme-client-wired-by-the-root → adapter-imported-only-by-the-root · MUST',
    '',
    "Acme's client is built only by the root.",
    '',
    '| Why | Tags |',
    '|---|---|',
    '| the vendor then stays at the edge. | [] |',
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
    'dictionary: []',
    'governs: ["**/acme.*"]',
    '---',
    '',
    '# Acme',
    '',
    '> Governs the files that call Acme.',
    '',
    `### acme-reached-through-its-entry → ${parent} · MUST`,
    '',
    'Acme is reached only through its package entry.',
    '',
    '| Why | Tags |',
    '|---|---|',
    '| a path inside Acme is not its contract. | [] |',
    '',
  ].join('\n'),
});

const createPack = (parent = 'dependency-reached-through-its-public-entry'): string => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-pack-')));

  created.push(folder);
  spawnSync('git', [
    'init',
    '--quiet',
    folder,
  ]);
  for (const [path, text] of Object.entries(packFilesOf(parent))) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  return folder;
};

// The Constitution's own check, run in the pack against this repository as its
// base, as a pack's author runs the one its base's archive carries.
const checkPack = (pack: string): Run => {
  const run = spawnSync(
    'bun',
    [
      join(REPOSITORY, 'src', 'entrypoints', 'blocks-check', 'main.ts'),
      '--base',
      REPOSITORY,
    ],
    {
      cwd: pack,
      encoding: 'utf8',
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
