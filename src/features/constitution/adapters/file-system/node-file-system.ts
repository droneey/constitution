import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { compareText } from '#/kernel';

import type { DigestWriter, FileTree } from '../../domain/contracts';

const BYTE_ORDER_MARK = '﻿';
const GIT_FILES = [
  'ls-files',
  '-z',
  '--cached',
  '--others',
  '--exclude-standard',
];

const isFile = (path: string): boolean =>
  statSync(path, {
    throwIfNoEntry: false,
  })?.isFile() === true;

const normalized = (text: string): string =>
  (text.startsWith(BYTE_ORDER_MARK)
    ? text.slice(BYTE_ORDER_MARK.length)
    : text
  ).replaceAll('\r\n', '\n');

// One adapter for the one system: the tree reads what git holds — an ignored
// file is no part of the constitution, and CI sees only committed files — and
// the writer puts the digests back beside it.
const createNodeFileSystem = (input: {
  root: string;
}): FileTree & DigestWriter => ({
  list: (): readonly string[] =>
    [
      ...new Set(
        execFileSync('git', GIT_FILES, {
          cwd: input.root,
          encoding: 'utf8',
        }).split('\0'),
      ),
    ]
      .filter((path) => path !== '' && isFile(join(input.root, path)))
      .toSorted(compareText),
  read: (path: string): string =>
    normalized(readFileSync(join(input.root, path), 'utf8')),
  write: ({ path, text }: { path: string; text: string }): void => {
    const target = join(input.root, path);

    mkdirSync(dirname(target), {
      recursive: true,
    });
    writeFileSync(target, text);
  },
});

export { createNodeFileSystem };
