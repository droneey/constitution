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
