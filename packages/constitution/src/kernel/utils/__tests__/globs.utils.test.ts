import { describe, expect, it } from 'bun:test';

import { isGoverned } from '../globs.utils';

describe('isGoverned', () => {
  it.each([
    {
      condition: '"**/" stands for some folders',
      glob: '**/ui/**',
      isMatch: true,
      path: 'src/ui/button.ts',
    },
    {
      condition: '"**/" stands for no folder',
      glob: '**/ui/**',
      isMatch: true,
      path: 'ui/button.ts',
    },
    {
      condition: '"**" stands for anything',
      glob: 'src/**',
      isMatch: true,
      path: 'src/a/b.ts',
    },
    {
      condition: '"*" stays within a folder',
      glob: '*.ts',
      isMatch: false,
      path: 'src/a.ts',
    },
    {
      condition: '"*" stands for a name',
      glob: '*.ts',
      isMatch: true,
      path: 'a.ts',
    },
    {
      condition: 'a dot stands only for a dot',
      glob: '*.ts',
      isMatch: false,
      path: 'axts',
    },
    {
      condition: 'the glob matches only the start of the path',
      glob: 'a.ts',
      isMatch: false,
      path: 'ba.ts',
    },
    {
      condition: '"?" stands for one character',
      glob: '?.md',
      isMatch: true,
      path: 'a.md',
    },
    {
      condition: '"?" stands for one character beyond the basic plane',
      glob: '?.md',
      isMatch: true,
      path: '😀.md',
    },
    {
      condition: '"?" meets a slash',
      glob: 'a?b',
      isMatch: false,
      path: 'a/b',
    },
    {
      condition: 'braces give alternatives',
      glob: '{a,b}.ts',
      isMatch: true,
      path: 'b.ts',
    },
    {
      condition: 'a comma lies outside braces',
      glob: 'x,y',
      isMatch: false,
      path: 'x',
    },
    {
      condition: 'a comma follows closed braces',
      glob: '{a,b}/c,d',
      isMatch: false,
      path: 'd',
    },
    {
      condition: 'the characters special to a pattern stand for themselves',
      glob: 'a.b+c^d$e|f(g)h[i]j\\k',
      isMatch: true,
      path: 'a.b+c^d$e|f(g)h[i]j\\k',
    },
    {
      condition: 'its braces do not pair',
      glob: '{a',
      isMatch: false,
      path: '{a',
    },
    {
      condition: 'a glob read as a path ends in the extension of the glob it meets',
      glob: '**/*.ts',
      isMatch: true,
      path: 'vite.*.config.ts',
    },
  ])('should say $isMatch when $condition', ({ glob, isMatch, path }) => {
    // Arrange
    const globs = [
      glob,
    ];

    // Act
    const matches = isGoverned({
      globs,
      path,
    });

    // Assert
    expect(matches).toBe(isMatch);
  });

  it('should say true when a later glob matches the path', () => {
    // Arrange
    const globs = [
      '*.md',
      '*.ts',
    ];

    // Act
    const matches = isGoverned({
      globs,
      path: 'a.ts',
    });

    // Assert
    expect(matches).toBe(true);
  });
});
