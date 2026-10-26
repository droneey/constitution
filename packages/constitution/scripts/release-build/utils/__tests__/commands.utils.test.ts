import { describe, expect, it } from 'bun:test';

import { commandsOf } from '../commands.utils';

describe('commandsOf', () => {
  it('should bundle a script with Bun, its packages left out only where asked, and pack a folder of modules with Python', () => {
    // Arrange
    const builds = {
      'tools/a/dist/a.js': {
        from: '../a/src/main.ts',
        packages: 'external',
        with: 'bun',
      },
      'tools/a/dist/b.js': {
        from: '../a/src/b.ts',
        with: 'bun',
      },
      'tools/c/dist/c.pyz': {
        from: '../c/src',
        main: 'c.main:main',
        with: 'zipapp',
      },
    } as const;

    // Act
    const commands = commandsOf(builds);

    // Assert
    expect(commands).toStrictEqual([
      [
        'bun',
        'build',
        '--target=bun',
        '--packages=external',
        '../a/src/main.ts',
        '--outfile',
        'tools/a/dist/a.js',
      ],
      [
        'bun',
        'build',
        '--target=bun',
        '../a/src/b.ts',
        '--outfile',
        'tools/a/dist/b.js',
      ],
      [
        'python3',
        '-m',
        'zipapp',
        '../c/src',
        '-m',
        'c.main:main',
        '-o',
        'tools/c/dist/c.pyz',
      ],
    ]);
  });
});
