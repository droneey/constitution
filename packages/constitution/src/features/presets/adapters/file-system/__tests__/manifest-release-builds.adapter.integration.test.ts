import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createManifestReleaseBuilds } from '../manifest-release-builds.adapter';

let folder = '';

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'release-builds-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

describe('createManifestReleaseBuilds', () => {
  it('should give each file the manifest lists under release, from its source', () => {
    // Arrange
    writeFileSync(
      join(folder, 'package.json'),
      JSON.stringify({
        name: 'pack',
        release: {
          'tools/a/dist/a.js': {
            from: '../a/src/main.ts',
            with: 'bun',
          },
        },
      }),
    );

    // Act
    const sources = createManifestReleaseBuilds({
      manifest: 'package.json',
    }).sourcesOf(folder);

    // Assert
    expect([
      ...sources,
    ]).toStrictEqual([
      [
        'tools/a/dist/a.js',
        '../a/src/main.ts',
      ],
    ]);
  });

  it('should give no build when the folder holds no manifest', () => {
    // Act
    const sources = createManifestReleaseBuilds({
      manifest: 'package.json',
    }).sourcesOf(folder);

    // Assert
    expect(sources.size).toBe(0);
  });

  it.each([
    {
      condition: 'the manifest does not parse',
      text: '{',
    },
    {
      condition: 'the manifest lists no release',
      text: JSON.stringify({
        name: 'pack',
      }),
    },
    {
      condition: 'a build names no source',
      text: JSON.stringify({
        release: {
          'tools/a.js': {
            with: 'bun',
          },
        },
      }),
    },
    {
      condition: 'its release is of another shape',
      text: JSON.stringify({
        release: {
          'tools/a.js': '../a.ts',
        },
      }),
    },
  ])('should give no build when $condition', ({ text }) => {
    // Arrange
    writeFileSync(join(folder, 'package.json'), text);

    // Act
    const sources = createManifestReleaseBuilds({
      manifest: 'package.json',
    }).sourcesOf(folder);

    // Assert
    expect(sources.size).toBe(0);
  });
});
