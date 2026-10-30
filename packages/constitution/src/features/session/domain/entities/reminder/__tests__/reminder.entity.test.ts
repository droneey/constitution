import { describe, expect, it } from 'bun:test';

import { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import { activeBlockOf, mustOf, sessionStateOf } from '../../../../__tests__/session.fixtures';
import { Reminder } from '../reminder.entity';

const ui = activeBlockOf({
  governs: [
    '**/ui/**',
  ],
  id: 'ui',
});
const typescript = activeBlockOf({
  governs: [
    '**/*.ts',
  ],
  id: 'typescript',
});
const uiMust = mustOf({
  block: 'ui',
  slug: 'inputs-are-labelled',
});
const apiMust = mustOf({
  block: 'api',
  slug: 'calls-are-typed',
});
const state = sessionStateOf({
  active: [
    ui,
    typescript,
  ],
  mustsBesideCore: [
    uiMust,
    apiMust,
  ],
});
const path = RepositoryRelativePath.create('src/ui/form.ts');

describe('Reminder.of', () => {
  it.each([
    {
      condition: 'no block was reminded of yet',
      expected: [
        {
          files: ui.files,
          id: ui.id,
          musts: [
            uiMust,
          ],
        },
        {
          files: typescript.files,
          id: typescript.id,
          musts: [],
        },
      ],
      reminded: [],
    },
    {
      condition: 'one block was reminded of',
      expected: [
        {
          files: typescript.files,
          id: typescript.id,
          musts: [],
        },
      ],
      reminded: [
        'ui',
      ],
    },
  ])(
    'should give the blocks governing the path that were not reminded of, with their musts, when $condition',
    ({ expected, reminded }) => {
      // Arrange
      const given = {
        path,
        reminded: new Set(reminded.map(BlockId.create)),
        state,
      };

      // Act
      const reminder = Reminder.of(given);

      // Assert
      expect(reminder).toStrictEqual({
        blocks: expected,
        path,
      });
    },
  );
});
