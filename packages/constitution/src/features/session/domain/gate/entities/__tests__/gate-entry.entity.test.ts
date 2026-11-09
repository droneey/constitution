import { describe, expect, it } from 'bun:test';

import { RefusalKey } from '../../value-objects';
import type { GateEntry } from '../gate-entry.entity';
import { GateEntry as Entries, GateEntryKind } from '../gate-entry.entity';

const key = RefusalKey.create('0123456789abcdef');
const other = RefusalKey.create('fedcba9876543210');

const refused = (on: RefusalKey): GateEntry => ({
  key: on,
  kind: GateEntryKind.Refused,
});

const passed: GateEntry = {
  key,
  kind: GateEntryKind.Passed,
};
const told: GateEntry = {
  kind: GateEntryKind.Told,
};
const reset: GateEntry = {
  kind: GateEntryKind.Reset,
};

describe('GateEntry.isPassedAfter', () => {
  it.each([
    {
      condition: 'the entries end with three refusals of the key',
      entries: [
        refused(other),
        refused(key),
        refused(key),
        refused(key),
      ],
      isPassed: true,
    },
    {
      condition: 'the entries end with two refusals of the key',
      entries: [
        refused(other),
        refused(key),
        refused(key),
      ],
      isPassed: false,
    },
    {
      condition: 'the context started afresh after three refusals',
      entries: [
        refused(key),
        refused(key),
        refused(key),
        reset,
      ],
      isPassed: false,
    },
    {
      condition: 'another key was refused between them',
      entries: [
        refused(key),
        refused(key),
        refused(other),
        refused(key),
      ],
      isPassed: false,
    },
    {
      condition: 'there is no entry',
      entries: [],
      isPassed: false,
    },
    {
      condition: 'the key passed after its refusals',
      entries: [
        refused(key),
        refused(key),
        refused(key),
        passed,
      ],
      isPassed: false,
    },
  ])('should say $isPassed when $condition', ({ entries, isPassed }) => {
    // Act
    const answer = Entries.isPassedAfter(entries, key);

    // Assert
    expect(answer).toBe(isPassed);
  });
});

describe('GateEntry.untoldPassesOf', () => {
  it('should count the passes after the last told', () => {
    // Arrange
    const entries = [
      passed,
      told,
      passed,
      reset,
      passed,
    ];

    // Act
    const passes = Entries.untoldPassesOf(entries);

    // Assert
    expect(passes).toBe(2);
  });
});
