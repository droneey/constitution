import { describe, expect, it } from 'bun:test';

import { RepositoryRelativePath } from '#/kernel/value-objects';

import { keptBlockOf, sessionStateOf } from '../../../__tests__/session.fixtures';
import { ActiveBlocks } from '../active-blocks.entity';

const ui = keptBlockOf({
  governs: [
    '**/ui/**',
  ],
  id: 'ui',
});
const api = keptBlockOf({
  governs: [
    'api/**',
  ],
  id: 'api',
});
const typescript = keptBlockOf({
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const webUi = keptBlockOf({
  unit: 'packages/web',
  governs: [
    'src/**',
  ],
  id: 'ui',
});
const webTypescript = keptBlockOf({
  unit: 'packages/web',
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const kitTypescript = keptBlockOf({
  unit: 'packages/web/kit',
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});

describe('ActiveBlocks.governing', () => {
  it.each([
    {
      active: [
        ui,
        api,
        typescript,
        ui,
      ],
      condition: 'the path lies in no package and a block is active twice',
      governing: [
        ui,
        typescript,
      ],
      path: 'src/ui/button.ts',
    },
    {
      active: [
        ui,
        typescript,
        webUi,
        webTypescript,
        kitTypescript,
      ],
      condition: 'the path lies in a package',
      governing: [
        webUi,
        webTypescript,
      ],
      path: 'packages/web/src/button.ts',
    },
    {
      active: [
        typescript,
        webTypescript,
        kitTypescript,
      ],
      condition: 'the path lies in a package within a package',
      governing: [
        kitTypescript,
      ],
      path: 'packages/web/kit/a.ts',
    },
    {
      active: [
        kitTypescript,
        webTypescript,
      ],
      condition: 'the path lies in a package within a package, the inner one listed first',
      governing: [
        kitTypescript,
      ],
      path: 'packages/web/kit/a.ts',
    },
    {
      active: [
        typescript,
        webUi,
      ],
      condition: "the path only starts with a package's name",
      governing: [
        typescript,
      ],
      path: 'packages/webapp/a.ts',
    },
  ])(
    'should give the blocks that govern the path, each once, when $condition',
    ({ active, governing, path }) => {
      // Arrange
      const state = sessionStateOf({
        active,
      });

      // Act
      const found = ActiveBlocks.governing(state, RepositoryRelativePath.create(path));

      // Assert
      expect(found).toStrictEqual(governing);
    },
  );
});
