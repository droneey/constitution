import { describe, expect, it } from 'bun:test';

import { activeBlockOf } from '../../../__tests__/session.fixtures';
import { governingOf } from '../governing.utils';

const UI = activeBlockOf({
  globs: [
    '**/ui/**',
  ],
  id: 'ui',
});
const API = activeBlockOf({
  globs: [
    'api/**',
  ],
  id: 'api',
});
const TYPESCRIPT = activeBlockOf({
  globs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const WEB_UI = activeBlockOf({
  app: 'packages/web',
  globs: [
    'src/**',
  ],
  id: 'ui',
  scope: 1,
});
const WEB_TYPESCRIPT = activeBlockOf({
  app: 'packages/web',
  globs: [
    '**/*.ts',
  ],
  id: 'typescript',
  scope: 1,
});
const KIT_TYPESCRIPT = activeBlockOf({
  app: 'packages/web/kit',
  globs: [
    '**/*.ts',
  ],
  id: 'typescript',
  scope: 2,
});

describe('governingOf', () => {
  it.each([
    {
      condition: '"**/" stands for some folders',
      glob: '**/ui/**',
      governing: [
        'block',
      ],
      path: 'src/ui/button.ts',
    },
    {
      condition: '"**/" stands for no folder',
      glob: '**/ui/**',
      governing: [
        'block',
      ],
      path: 'ui/button.ts',
    },
    {
      condition: '"**" stands for anything',
      glob: 'src/**',
      governing: [
        'block',
      ],
      path: 'src/a/b.ts',
    },
    {
      condition: '"*" stays within a folder',
      glob: '*.ts',
      governing: [],
      path: 'src/a.ts',
    },
    {
      condition: '"*" stands for a name',
      glob: '*.ts',
      governing: [
        'block',
      ],
      path: 'a.ts',
    },
    {
      condition: 'a dot stands only for a dot',
      glob: '*.ts',
      governing: [],
      path: 'axts',
    },
    {
      condition: 'the glob matches only the start of the path',
      glob: 'a.ts',
      governing: [],
      path: 'ba.ts',
    },
    {
      condition: '"?" stands for one character',
      glob: '?.md',
      governing: [
        'block',
      ],
      path: 'a.md',
    },
    {
      condition: '"?" stands for one character beyond the basic plane',
      glob: '?.md',
      governing: [
        'block',
      ],
      path: '😀.md',
    },
    {
      condition: '"?" meets a slash',
      glob: 'a?b',
      governing: [],
      path: 'a/b',
    },
    {
      condition: 'braces give alternatives',
      glob: '{a,b}.ts',
      governing: [
        'block',
      ],
      path: 'b.ts',
    },
    {
      condition: 'a comma lies outside braces',
      glob: 'x,y',
      governing: [],
      path: 'x',
    },
    {
      condition: 'a comma follows closed braces',
      glob: '{a,b}/c,d',
      governing: [],
      path: 'd',
    },
    {
      condition: 'the characters special to a pattern stand for themselves',
      glob: 'a.b+c^d$e|f(g)h[i]j\\k',
      governing: [
        'block',
      ],
      path: 'a.b+c^d$e|f(g)h[i]j\\k',
    },
    {
      condition: 'its braces do not pair',
      glob: '{a',
      governing: [],
      path: '{a',
    },
  ])(
    'should name the block of the glob as it matches when $condition',
    ({ glob, governing, path }) => {
      // Arrange
      const active = [
        activeBlockOf({
          globs: [
            glob,
          ],
          id: 'block',
        }),
      ];

      // Act
      const found = governingOf({
        active,
        path,
      });

      // Assert
      expect(found.map((block) => block.id)).toStrictEqual([
        ...governing,
      ]);
    },
  );

  it('should name a block when a later glob of the block matches the path', () => {
    // Arrange
    const active = [
      activeBlockOf({
        globs: [
          '*.md',
          '*.ts',
        ],
        id: 'block',
      }),
    ];

    // Act
    const found = governingOf({
      active,
      path: 'a.ts',
    });

    // Assert
    expect(found.map((block) => block.id)).toStrictEqual([
      'block',
    ]);
  });

  it.each([
    {
      active: [
        UI,
        API,
        TYPESCRIPT,
        UI,
      ],
      condition: 'the path lies in no package and a block is active twice',
      governing: [
        UI,
        TYPESCRIPT,
      ],
      path: 'src/ui/button.ts',
    },
    {
      active: [
        UI,
        TYPESCRIPT,
        WEB_UI,
        WEB_TYPESCRIPT,
        KIT_TYPESCRIPT,
      ],
      condition: 'the path lies in a package',
      governing: [
        WEB_UI,
        WEB_TYPESCRIPT,
      ],
      path: 'packages/web/src/button.ts',
    },
    {
      active: [
        TYPESCRIPT,
        WEB_TYPESCRIPT,
        KIT_TYPESCRIPT,
      ],
      condition: 'the path lies in a package within a package',
      governing: [
        KIT_TYPESCRIPT,
      ],
      path: 'packages/web/kit/a.ts',
    },
    {
      active: [
        TYPESCRIPT,
        WEB_UI,
      ],
      condition: "the path only starts with a package's name",
      governing: [
        TYPESCRIPT,
      ],
      path: 'packages/webapp/a.ts',
    },
    {
      active: [
        activeBlockOf({
          app: 'web',
          globs: [
            'web/**',
          ],
          id: 'repository',
        }),
      ],
      condition: 'a block of the repository names a folder',
      governing: [
        activeBlockOf({
          app: 'web',
          globs: [
            'web/**',
          ],
          id: 'repository',
        }),
      ],
      path: 'web/a.ts',
    },
    {
      active: [
        activeBlockOf({
          globs: [
            '/**',
          ],
          id: 'repository',
        }),
        activeBlockOf({
          id: 'unnamed',
          scope: 1,
        }),
      ],
      condition: 'a block of a package names no folder',
      governing: [
        activeBlockOf({
          globs: [
            '/**',
          ],
          id: 'repository',
        }),
      ],
      path: '/a.ts',
    },
    {
      active: [
        activeBlockOf({
          app: 'web',
          id: 'first',
          scope: 1,
        }),
        activeBlockOf({
          app: 'web',
          id: 'second',
          scope: 2,
        }),
      ],
      condition: 'two units name the same folder',
      governing: [
        activeBlockOf({
          app: 'web',
          id: 'first',
          scope: 1,
        }),
      ],
      path: 'web/a.ts',
    },
  ])(
    'should give the blocks that govern the path, each once, when $condition',
    ({ active, governing, path }) => {
      // Arrange
      const asked = {
        active,
        path,
      };

      // Act
      const found = governingOf(asked);

      // Assert
      expect(found).toStrictEqual(governing);
    },
  );
});
