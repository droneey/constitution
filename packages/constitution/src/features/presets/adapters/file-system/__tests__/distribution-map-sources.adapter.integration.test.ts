import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { runDistributionSourcesSuite } from '../../../__tests__/distribution-sources.suite';
import { createDistributionMapSources } from '../distribution-map-sources.adapter';

let folder = '';

const MAP = 'distribution.json';

// The distribution's folder beside the packages it packs: each package's folder, then its files.
const writeFolder = (files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(folder, path, '..'), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }
};

const mapOf = (packages: readonly string[]): string =>
  JSON.stringify(
    Object.fromEntries(
      packages.map((name) => [
        `tools/${name}/dist/${name}.js`,
        {
          file: `dist/${name}.js`,
          package: `../${name}`,
        },
      ]),
    ),
  );

const sources = createDistributionMapSources({
  builds: [
    {
      keys: [
        'tasks',
        'build',
      ],
      manifestName: 'tasks.json',
    },
    {
      keys: [
        'tool',
        'build',
      ],
      manifestName: 'tasks.toml',
    },
  ],
  mapName: MAP,
});

const releaseFolderPath = (): AbsolutePath => AbsolutePath.create(join(folder, 'distribution'));

const builtFilesOf = (): readonly string[] => [
  ...sources.builtFilesOf(releaseFolderPath()),
];

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'distribution-map-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createDistributionMapSources', () => {
  it('should give each file the map packs from a package that builds it, by script or by task', () => {
    // Arrange
    writeFolder({
      [`distribution/${MAP}`]: mapOf([
        'scripted',
        'tasked',
        'unbuilt',
        'broken',
        'gone',
      ]),
      'scripted/tasks.json': JSON.stringify({
        tasks: {
          build: 'make',
        },
      }),
      'tasked/tasks.toml': '[tool]\nbuild = "make"\n',
      'unbuilt/tasks.json': JSON.stringify({
        tasks: {
          check: 'lint',
        },
        tool: 'build',
      }),
      'broken/tasks.toml': '[tool\n',
    });

    // Act
    const built = builtFilesOf();

    // Assert
    expect(built).toStrictEqual([
      'tools/scripted/dist/scripted.js',
      'tools/tasked/dist/tasked.js',
    ]);
  });

  it.each([
    {
      condition: 'the folder holds no map',
      files: {},
    },
    {
      condition: 'the map does not parse',
      files: {
        [`distribution/${MAP}`]: '{',
      },
    },
    {
      condition: 'an entry of the map names no package',
      files: {
        [`distribution/${MAP}`]: JSON.stringify({
          'tools/a.js': {
            file: 'dist/a.js',
          },
        }),
      },
    },
  ])('should give no file when $condition', ({ files }) => {
    // Arrange
    writeFolder(files);

    // Act
    const built = builtFilesOf();

    // Assert
    expect(built).toStrictEqual([]);
  });
});

runDistributionSourcesSuite({
  name: 'createDistributionMapSources',
  sourcesOf: (world) => {
    const packed = [
      ...world.built,
      ...world.unbuilt,
    ];

    writeFolder({
      [`distribution/${MAP}`]: JSON.stringify(
        Object.fromEntries(
          packed.map((file, at) => [
            file,
            {
              file,
              package: `../package-${at}`,
            },
          ]),
        ),
      ),
      ...Object.fromEntries(
        world.built.map((_file, at) => [
          `package-${at}/tasks.json`,
          JSON.stringify({
            tasks: {
              build: 'make',
            },
          }),
        ]),
      ),
    });

    return {
      releaseFolderPath: releaseFolderPath(),
      sources,
    };
  },
});
