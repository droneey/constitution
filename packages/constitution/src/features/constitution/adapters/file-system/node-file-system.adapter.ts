import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { compareText } from '#/kernel/utils';

import type { FileTree } from '../../domain/contracts';

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
  (text.startsWith(BYTE_ORDER_MARK) ? text.slice(BYTE_ORDER_MARK.length) : text).replaceAll(
    '\r\n',
    '\n',
  );

// One adapter for the one system: the tree reads what git holds — an ignored
// file is no part of the constitution, and CI sees only committed files.
const createNodeFileSystem = (input: { root: string }): FileTree => ({
  list: (): readonly string[] =>
    [
      ...new Set(
        execFileSync('git', GIT_FILES, {
          cwd: input.root,
          encoding: 'utf8',
        }).split('\0'),
      ),
    ]
      .filter((path) => isFile(join(input.root, path)))
      .toSorted(compareText),
  read: (path: string): string => normalized(readFileSync(join(input.root, path), 'utf8')),
});

// The installed constitution a pack extends, as mise unpacks it: no repository
// of its own, so its blocks and vocabulary are read from the folders.
const BASE_FOLDER = 'blocks';
const BASE_VOCABULARY = 'vocabulary.yaml';

const createNodeBaseTree = (input: { root: string }): FileTree => ({
  list: (): readonly string[] =>
    [
      ...(existsSync(join(input.root, BASE_FOLDER))
        ? readdirSync(join(input.root, BASE_FOLDER), {
            recursive: true,
          })
            .map((path) => `${BASE_FOLDER}/${path}`)
            .filter((path) => isFile(join(input.root, path)))
        : []),
      ...(isFile(join(input.root, BASE_VOCABULARY))
        ? [
            BASE_VOCABULARY,
          ]
        : []),
    ].toSorted(compareText),
  read: (path: string): string => normalized(readFileSync(join(input.root, path), 'utf8')),
});

// The root of the repository that holds a folder, where its README and decision log live.
const repositoryRootOf = (folder: string): string =>
  execFileSync(
    'git',
    [
      'rev-parse',
      '--show-toplevel',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  ).trim();

export { createNodeBaseTree, createNodeFileSystem, repositoryRootOf };
