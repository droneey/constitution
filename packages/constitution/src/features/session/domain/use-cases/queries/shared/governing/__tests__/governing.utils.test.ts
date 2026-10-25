import { describe, expect, it } from 'bun:test';

import { activeBlockOf } from '../../../../../../__tests__/session.fixtures';
import { governingOf } from '../governing.utils';

const ui = activeBlockOf({
  governs: [
    '**/ui/**',
  ],
  id: 'ui',
});
const api = activeBlockOf({
  governs: [
    'api/**',
  ],
  id: 'api',
});
const typescript = activeBlockOf({
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const webUi = activeBlockOf({
  unit: 'packages/web',
  governs: [
    'src/**',
  ],
  id: 'ui',
});
const webTypescript = activeBlockOf({
  unit: 'packages/web',
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const kitTypescript = activeBlockOf({
  unit: 'packages/web/kit',
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});

describe('governingOf', () => {
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
