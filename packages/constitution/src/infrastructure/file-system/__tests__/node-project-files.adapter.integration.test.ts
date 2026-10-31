import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { FileRead, FileReadStatus } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

import { createNodeProjectFiles } from '../node-project-files.adapter';

let made = '';
let real = '';

const limits = {
  maxFiles: 2,
};
const LOCKED = 0o000;
const OPEN = 0o755;
// Why: mkfifo needs only the PATH it is found on.
const pipeEnvironment = Object.fromEntries([
  [
    'PATH',
    process.env['PATH'] ?? '',
  ],
]);

const at = (path: string): AbsolutePath => AbsolutePath.create(join(made, path));

const textOf = (read: FileRead): string | undefined =>
  read.status === FileReadStatus.Read ? read.text : undefined;

const systemCodeOf = (cause: unknown): unknown =>
  cause instanceof Error && 'code' in cause ? cause.code : undefined;

beforeEach(() => {
  made = mkdtempSync(join(tmpdir(), 'node-project-files-'));
  real = realpathSync(made);
  writeFileSync(at('notes.md'), 'notes\n');
  writeFileSync(at('locked.md'), 'locked\n');
  chmodSync(at('locked.md'), LOCKED);
  execFileSync(
    'mkfifo',
    [
      at('pipe'),
    ],
    {
      env: pipeEnvironment,
    },
  );
  mkdirSync(at('folder/deep'), {
    recursive: true,
  });
  writeFileSync(at('folder/inner.md'), 'inner\n');
  writeFileSync(at('folder/deep/more.md'), 'more\n');
  symlinkSync('../notes.md', at('folder/file-link'));
  symlinkSync('deep', at('folder/deep-link'));
  symlinkSync('..', at('folder/deep/up'));
  execFileSync(
    'mkfifo',
    [
      at('folder/pipe'),
    ],
    {
      env: pipeEnvironment,
    },
  );
  symlinkSync('notes.md', at('file-link'));
  symlinkSync('folder', at('folder-link'));
  symlinkSync(join(made, 'folder/deep'), at('absolute-link'));
  symlinkSync('gone', at('dangling'));
  symlinkSync('loop-b', at('loop-a'));
  symlinkSync('loop-a', at('loop-b'));
  mkdirSync(at('back\\slash'));
  symlinkSync('back\\slash', at('back-link'));
  mkdirSync(at('sealed/shut'), {
    recursive: true,
  });
  writeFileSync(at('sealed/open.md'), 'open\n');
  chmodSync(at('sealed/shut'), LOCKED);
});

afterEach(() => {
  chmodSync(at('sealed/shut'), OPEN);
  rmSync(made, {
    force: true,
    recursive: true,
  });
});

describe('createNodeProjectFiles', () => {
  it.each([
    {
      condition: 'a file',
      expected: {
        exists: true,
        isFile: true,
        isFolder: false,
        status: FileReadStatus.Read,
        text: 'notes\n',
      },
      path: 'notes.md',
    },
    {
      condition: 'a folder',
      expected: {
        exists: true,
        isFile: false,
        isFolder: true,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'folder',
    },
    {
      condition: 'a link to a file',
      expected: {
        exists: true,
        isFile: true,
        isFolder: false,
        status: FileReadStatus.Read,
        text: 'notes\n',
      },
      path: 'file-link',
    },
    {
      condition: 'a link to a folder',
      expected: {
        exists: true,
        isFile: false,
        isFolder: true,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'folder-link',
    },
    {
      condition: 'a dangling link',
      expected: {
        exists: false,
        isFile: false,
        isFolder: false,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'dangling',
    },
    {
      condition: 'a loop of links',
      expected: {
        exists: false,
        isFile: false,
        isFolder: false,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'loop-a',
    },
    {
      condition: 'a path under a file',
      expected: {
        exists: false,
        isFile: false,
        isFolder: false,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'notes.md/inner.md',
    },
    {
      condition: 'a named pipe',
      expected: {
        exists: true,
        isFile: false,
        isFolder: false,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'pipe',
    },
    {
      condition: 'a file no one may read',
      expected: {
        exists: true,
        isFile: true,
        isFolder: false,
        status: FileReadStatus.Unreadable,
        text: undefined,
      },
      path: 'locked.md',
    },
    {
      condition: 'nothing',
      expected: {
        exists: false,
        isFile: false,
        isFolder: false,
        status: FileReadStatus.Missing,
        text: undefined,
      },
      path: 'missing.md',
    },
  ])(
    'should tell what is there and read only a readable file when the path is $condition',
    ({ expected, path }) => {
      // Arrange
      const files = createNodeProjectFiles(limits);

      // Act
      const seen = {
        exists: files.exists(at(path)),
        isFile: files.isFile(at(path)),
        isFolder: files.isFolder(at(path)),
        status: files.read(at(path)).status,
        text: textOf(files.read(at(path))),
      };

      // Assert
      expect(seen).toStrictEqual(expected);
    },
  );

  it('should keep the system error as the cause when the file cannot be read', () => {
    // Arrange
    const files = createNodeProjectFiles(limits);

    // Act
    const cause = FileRead.causeOf(files.read(at('locked.md')));

    // Assert
    expect(systemCodeOf(cause)).toBe('EACCES');
  });

  it.each([
    {
      condition: 'the folder itself',
      path: 'folder',
    },
    {
      condition: 'a link to it',
      path: 'folder-link',
    },
  ])(
    'should list the regular files below the folder, no link followed and no pipe, when it is $condition',
    ({ path }) => {
      // Arrange
      const files = createNodeProjectFiles(limits);

      // Act
      const listed = files.listFiles(at(path));

      // Assert
      expect(listed?.toSorted()).toStrictEqual([
        'deep/more.md',
        'inner.md',
      ]);
    },
  );

  it.each([
    {
      condition: 'a file',
      path: 'notes.md',
    },
    {
      condition: 'nothing',
      path: 'missing',
    },
    {
      condition: 'a folder holding one that cannot be read',
      path: 'sealed',
    },
  ])('should list nothing when the folder is $condition', ({ path }) => {
    // Arrange
    const files = createNodeProjectFiles(limits);

    // Act
    const listed = files.listFiles(at(path));

    // Assert
    expect(listed).toBe(undefined);
  });

  it('should list nothing when a folder below it holds more files than the limit', () => {
    // Arrange
    mkdirSync(at('nest/inner'), {
      recursive: true,
    });
    writeFileSync(at('nest/inner/a.md'), 'a\n');
    writeFileSync(at('nest/inner/b.md'), 'b\n');
    writeFileSync(at('nest/inner/c.md'), 'c\n');

    const files = createNodeProjectFiles(limits);

    // Act
    const listed = files.listFiles(at('nest'));

    // Assert
    expect(listed).toBe(undefined);
  });

  it.each([
    {
      condition: 'the limit lets no file be listed',
      maxFiles: 0,
    },
    {
      condition: 'the folder holds one file more than the limit',
      maxFiles: 1,
    },
  ])('should list nothing when $condition', ({ maxFiles }) => {
    // Arrange
    const files = createNodeProjectFiles({
      maxFiles,
    });

    // Act
    const listed = files.listFiles(at('folder'));

    // Assert
    expect(listed).toBe(undefined);
  });

  it.each([
    {
      condition: 'it holds no link of its own',
      expected: 'folder/deep',
      path: 'folder/deep',
    },
    {
      condition: 'it is a link',
      expected: 'folder',
      path: 'folder-link',
    },
    {
      condition: 'a parent follows a link, which leaves the target of the link',
      expected: 'folder',
      path: 'folder-link/deep-link/..',
    },
    {
      condition: 'it holds empty and current parts',
      expected: 'folder/deep',
      path: '/folder//./deep/',
    },
    {
      condition: 'a link names an absolute path through another link',
      expected: 'folder/deep',
      path: 'absolute-link',
    },
    {
      condition: 'a name holds a backslash',
      expected: 'back\\slash',
      path: 'back-link',
    },
  ])('should resolve the folder link by link when $condition', ({ expected, path }) => {
    // Arrange
    const files = createNodeProjectFiles(limits);

    // Act
    const resolved = files.realFolder(AbsolutePath.create(`${made}/${path}`));

    // Assert
    expect<string | undefined>(resolved).toBe(`${real}/${expected}`);
  });

  it.each([
    {
      condition: 'the root',
      path: '/',
    },
    {
      condition: 'a parent of the root',
      path: '/../..',
    },
  ])('should resolve to the root when the folder is $condition', ({ path }) => {
    // Arrange
    const files = createNodeProjectFiles(limits);

    // Act
    const resolved = files.realFolder(AbsolutePath.create(path));

    // Assert
    expect<string | undefined>(resolved).toBe('/');
  });

  it.each([
    {
      condition: 'a file',
      path: 'notes.md',
    },
    {
      condition: 'nothing',
      path: 'missing',
    },
    {
      condition: 'a loop of links',
      path: 'loop-a',
    },
  ])('should resolve no folder when the path is $condition', ({ path }) => {
    // Arrange
    const files = createNodeProjectFiles(limits);

    // Act
    const resolved = files.realFolder(at(path));

    // Assert
    expect<string | undefined>(resolved).toBe(undefined);
  });
});
