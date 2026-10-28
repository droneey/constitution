import { describe, expect, it } from 'bun:test';

import type { PresetValue as Value } from '../preset-value.entity';
import { PresetValue } from '../preset-value.entity';
import type { Setting } from '../setting.entity';

describe('PresetValue', () => {
  it.each<{
    condition: string;
    listed: Setting;
    slot: string | undefined;
  }>([
    {
      condition: 'it holds its slot alone',
      listed: {
        slot: 'checks',
      },
      slot: 'checks',
    },
    {
      condition: 'it holds a slot beside other keys',
      listed: {
        name: 'lint',
        slot: 'checks',
      },
      slot: undefined,
    },
    {
      condition: 'its slot is no name',
      listed: {
        slot: 1,
      },
      slot: undefined,
    },
  ])('should read the slot a list item places when $condition', ({ listed, slot }) => {
    // Act
    const read = PresetValue.slotOf(listed);

    // Assert
    expect(read).toBe(slot);
  });

  it.each<{
    condition: string;
    listed: Setting;
    placesSlot: boolean;
  }>([
    {
      condition: 'one of its own lists places the slot',
      listed: {
        includes: [
          '**/*.controller.ts',
          {
            slot: 'injected-classes',
          },
        ],
      },
      placesSlot: true,
    },
    {
      condition: 'its list places another slot',
      listed: {
        includes: [
          {
            slot: 'decorated-constructors',
          },
        ],
      },
      placesSlot: false,
    },
    {
      condition: 'only a map below it holds the list',
      listed: {
        files: {
          includes: [
            {
              slot: 'injected-classes',
            },
          ],
        },
      },
      placesSlot: false,
    },
    {
      condition: 'it is the slot itself',
      listed: {
        slot: 'injected-classes',
      },
      placesSlot: false,
    },
    {
      condition: 'it is a text',
      listed: 'injected-classes',
      placesSlot: false,
    },
  ])('should tell an element that places a slot when $condition', ({ listed, placesSlot }) => {
    // Act
    const answer = PresetValue.placesSlot(listed, 'injected-classes');

    // Assert
    expect(answer).toBe(placesSlot);
  });

  it('should take out the slots of lists at any depth, an item that places one included', () => {
    // Arrange
    const setting: Setting = {
      overrides: [
        {
          slot: 'more',
        },
        {
          includes: [
            'a',
            {
              slot: 'injected-classes',
            },
          ],
          linter: {
            enabled: true,
          },
        },
      ],
    };

    // Act
    const left = PresetValue.withoutSlots(setting);

    // Assert
    expect(left).toStrictEqual({
      overrides: [
        {
          includes: [
            'a',
          ],
          linter: {
            enabled: true,
          },
        },
      ],
    });
  });

  it.each<{
    condition: string;
    given: Setting;
    held: Setting | undefined;
    isFilled: boolean;
  }>([
    {
      condition: 'it is the same, with no slot',
      given: {
        includes: [
          'a',
        ],
      },
      held: {
        includes: [
          'a',
        ],
      },
      isFilled: true,
    },
    {
      condition: 'its slot holds the items inserted',
      given: {
        includes: [
          'a',
          {
            slot: 'more',
          },
          'z',
        ],
      },
      held: {
        includes: [
          'a',
          'b',
          'c',
          'z',
        ],
      },
      isFilled: true,
    },
    {
      condition: 'its slot is left empty',
      given: [
        {
          slot: 'more',
        },
      ],
      held: [],
      isFilled: true,
    },
    {
      condition: 'an item beside the slot differs',
      given: [
        'a',
        {
          slot: 'more',
        },
        'z',
      ],
      held: [
        'a',
        'b',
        'y',
      ],
      isFilled: false,
    },
    {
      condition: 'the held list ends early',
      given: [
        'a',
        'z',
      ],
      held: [
        'a',
      ],
      isFilled: false,
    },
    {
      condition: 'the held list goes on',
      given: [
        'a',
      ],
      held: [
        'a',
        'b',
      ],
      isFilled: false,
    },
    {
      condition: 'the held map has a key more',
      given: {
        a: 1,
      },
      held: {
        a: 1,
        b: 2,
      },
      isFilled: false,
    },
    {
      condition: 'a value of the held map differs',
      given: {
        a: 1,
        b: 2,
      },
      held: {
        a: 1,
        b: 3,
      },
      isFilled: false,
    },
    {
      condition: 'a list meets a map',
      given: [
        'a',
      ],
      held: {
        a: 1,
      },
      isFilled: false,
    },
    {
      condition: 'a map meets a list',
      given: {
        a: 1,
      },
      held: [
        'a',
      ],
      isFilled: false,
    },
    {
      condition: 'nothing is held',
      given: 'a',
      held: undefined,
      isFilled: false,
    },
  ])(
    'should tell a held setting that fills the slots of the one given when $condition',
    ({ given, held, isFilled }) => {
      // Act
      const answer = PresetValue.isFilledFrom(given, held);

      // Assert
      expect(answer).toBe(isFilled);
    },
  );

  it.each<{
    condition: string;
    isInsertOnly: boolean;
    given: Value;
  }>([
    {
      condition: 'every pair inserts, at any depth',
      isInsertOnly: true,
      given: PresetValue.mapOf([
        {
          key: 'jobs@checks',
          value: PresetValue.plain([
            'lint',
          ]),
        },
        {
          key: 'pre-commit',
          value: PresetValue.mapOf([
            {
              key: 'commands@fix',
              value: PresetValue.plain([
                'format',
              ]),
            },
          ]),
        },
      ]),
    },
    {
      condition: 'a pair writes a plain setting beside an insert',
      isInsertOnly: false,
      given: PresetValue.mapOf([
        {
          key: 'jobs@checks',
          value: PresetValue.plain([
            'lint',
          ]),
        },
        {
          key: 'parallel',
          value: PresetValue.plain(true),
        },
      ]),
    },
    {
      condition: 'it is an empty map',
      isInsertOnly: false,
      given: PresetValue.mapOf([]),
    },
  ])('should tell a value that only inserts when $condition', ({ given, isInsertOnly }) => {
    // Act
    const answer = PresetValue.isInsertOnly(given);

    // Assert
    expect(answer).toBe(isInsertOnly);
  });
});
