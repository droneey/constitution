import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { z } from 'zod';

import { SEAM_FOLDER_NAME } from '#/kernel/constants';

import type { UnitFixture } from './applied-unit.fixtures';
import { appliedUnit } from './applied-unit.fixtures';
import { installedIn, release, toolEnvironment } from './package.fixtures';

interface ToolRun {
  readonly status: number;
  readonly stderr: string;
  readonly stdout: string;
}

interface ToolInput {
  readonly command: readonly string[];
  readonly env?: ReadonlyMap<string, string>;
  readonly folder: string;
}

interface Load {
  readonly output: readonly string[];
  readonly status: number;
}

interface LoadInput extends Partial<Pick<UnitFixture, 'blocks' | 'files'>> {
  readonly command: readonly string[];
  readonly isInstalled?: boolean;
}

const presetsFolder = join(release, 'presets');
const blocksFolder = join(release, 'blocks');
const PRESET_FILE = /\.yaml$/;
const EVERY = '*';
const CORE = 'core';
const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n/;
const PASSPORT_EXTENSION = '.md';
const AXIS_MARK = '@';
const ID_SEPARATOR = '/';

const passportModel = z.object({
  id: z.string(),
});

const presetFile = z.record(z.string(), z.record(z.string(), z.record(z.string(), z.unknown())));

const blockIdsIn = (folder: string): ReadonlySet<string> =>
  new Set(
    readdirSync(folder, {
      recursive: true,
    })
      .map(String)
      .filter((path) => `${basename(dirname(path))}${PASSPORT_EXTENSION}` === basename(path))
      .flatMap((path) => {
        const frontMatter = FRONT_MATTER.exec(readFileSync(join(folder, path), 'utf8'))?.[1];

        return frontMatter === undefined
          ? []
          : [
              passportModel.parse(Bun.YAML.parse(frontMatter)).id,
            ];
      }),
  );

const read: {
  blockIds?: ReadonlySet<string>;
} = {};

const blockIds = (): ReadonlySet<string> => {
  read.blockIds ??= blockIdsIn(blocksFolder);

  return read.blockIds;
};

// Why: listing a child block turns its ancestors on, so the widest unit lists only the blocks no
// other listed block descends from.
const leavesOf = (blocks: ReadonlySet<string>): readonly string[] =>
  [
    ...blocks,
  ].filter(
    (block) =>
      blockIds().has(block) &&
      ![
        ...blocks,
      ].some((other) => other.startsWith(`${block}${ID_SEPARATOR}`)),
  );

const presetFilesOf = (reader: string): readonly string[] =>
  readdirSync(join(presetsFolder, reader), {
    recursive: true,
  })
    .map(String)
    .filter((path) => PRESET_FILE.test(path) && path.startsWith(AXIS_MARK));

const blocksOfFile = (input: { path: string; reader: string }): readonly string[] => {
  const [, ...withs] = input.path
    .replace(PRESET_FILE, '')
    .split(`${ID_SEPARATOR}${SEAM_FOLDER_NAME}${ID_SEPARATOR}`);
  const entries = presetFile.parse(
    Bun.YAML.parse(readFileSync(join(presetsFolder, input.reader, input.path), 'utf8')),
  );

  return [
    ...withs,
    ...Object.entries(entries).flatMap(([block, rules]) => [
      block,
      ...Object.values(rules).flatMap((languages) => Object.keys(languages)),
    ]),
  ];
};

const readerBlocks = new Map<string, readonly string[]>();

const blocksOfReader = (reader: string): readonly string[] => {
  const known = readerBlocks.get(reader);

  if (known !== undefined) {
    return known;
  }

  const blocks = presetFilesOf(reader).flatMap((path) =>
    blocksOfFile({
      path,
      reader,
    }),
  );

  readerBlocks.set(reader, blocks);

  return blocks;
};

const widestUnitOf = (reader: string, more: Partial<UnitFixture> = {}): UnitFixture => ({
  ...more,
  blocks: leavesOf(
    new Set(
      [
        reader,
        ...blocksOfReader(reader),
        ...(more.blocks ?? []),
      ].filter((block) => block !== CORE && block !== EVERY),
    ),
  ).toSorted((left, right) => left.localeCompare(right)),
});

const widestAppliedUnit = (reader: string, more: Partial<UnitFixture> = {}): string =>
  appliedUnit(widestUnitOf(reader, more));

const pythonPackage: Readonly<Record<string, string>> = {
  'src/unit/__init__.py': '"""The unit."""\n',
};

const runTool = async (input: ToolInput): Promise<ToolRun> => {
  const running = Bun.spawn(
    [
      ...input.command,
    ],
    {
      cwd: input.folder,
      env: toolEnvironment(input.env),
      stderr: 'pipe',
      stdout: 'pipe',
    },
  );
  const [stdout, stderr, status] = await Promise.all([
    new Response(running.stdout).text(),
    new Response(running.stderr).text(),
    running.exited,
  ]);

  return {
    status,
    stderr,
    stdout,
  };
};

const linesOf = (text: string): readonly string[] => text.split('\n').filter((line) => line !== '');

const loadOf = async (reader: string, input: LoadInput): Promise<Load> => {
  const { command, isInstalled, ...unit } = input;
  const folder = widestAppliedUnit(reader, unit);
  const run = await runTool({
    command,
    folder: isInstalled === true ? installedIn(folder) : folder,
  });

  return {
    output: linesOf(`${run.stdout}${run.stderr}`),
    status: run.status,
  };
};

export type { Load, ToolRun };
export { linesOf, loadOf, pythonPackage, runTool, widestAppliedUnit };
