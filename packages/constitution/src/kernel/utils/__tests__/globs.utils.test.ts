import { describe, expect, it } from 'bun:test';

import { globMatches } from '../globs.utils';

describe('globMatches', () => {
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
      condition: '"**/" stands for folders only when a separator ends them',
      glob: '**/x.ts',
      isMatch: false,
      path: 'ax.ts',
    },
    {
      condition: '"*" stands for nothing',
      glob: 'a*.ts',
      isMatch: true,
      path: 'a.ts',
    },
    {
      condition: '"**" stands for nothing',
      glob: 'src/**',
      isMatch: true,
      path: 'src/',
    },
    {
      condition: '"?" stands for no character',
      glob: 'a?',
      isMatch: false,
      path: 'a',
    },
    {
      condition: 'braces nest',
      glob: '{a,{b,c}}.ts',
      isMatch: true,
      path: 'c.ts',
    },
    {
      condition: 'an alternative is empty',
      glob: '{a,}b.ts',
      isMatch: true,
      path: 'b.ts',
    },
    {
      condition: 'an alternative holds "**/"',
      glob: '{**/x,y}.ts',
      isMatch: true,
      path: 'p/q/x.ts',
    },
    {
      condition: 'a closing brace pairs with none',
      glob: 'a}',
      isMatch: false,
      path: 'a}',
    },
    {
      condition: 'a brace inside braces is never closed',
      glob: '{a,{b}',
      isMatch: false,
      path: 'a',
    },
    {
      condition: 'braces nest as deep as the limit',
      glob: `${'{'.repeat(32)}a${'}'.repeat(32)}`,
      isMatch: true,
      path: 'a',
    },
    {
      condition: 'braces nest deeper than the limit',
      glob: `${'{'.repeat(33)}a${'}'.repeat(33)}`,
      isMatch: false,
      path: 'a',
    },
    {
      condition: 'empty alternatives follow one another, each a way round the others',
      glob: `${'{,}'.repeat(40)}a`,
      isMatch: true,
      path: 'a',
    },
    {
      condition: 'stars that a backtracking engine would retry meet a long name',
      glob: `${'*a'.repeat(12)}*b`,
      isMatch: false,
      path: 'a'.repeat(20_000),
    },
    {
      condition: 'a glob read as a path ends in the extension of the glob it meets',
      glob: '**/*.ts',
      isMatch: true,
      path: 'vite.*.config.ts',
    },
  ])('should say $isMatch when $condition', ({ glob, isMatch, path }) => {
    // Act
    const matches = globMatches({
      glob,
      path,
    });

    // Assert
    expect(matches).toBe(isMatch);
  });
});
