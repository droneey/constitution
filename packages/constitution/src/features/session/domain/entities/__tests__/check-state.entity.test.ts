import { describe, expect, it } from 'bun:test';

import { CheckKind, CheckState } from '../check-state.entity';

describe('CheckState', () => {
  it.each([
    {
      command: 'bun run check',
      condition: 'constitution.yaml names a check',
      expected: {
        command: 'bun run check',
        kind: CheckKind.Named,
      },
    },
    {
      command: undefined,
      condition: 'it names none',
      expected: {
        kind: CheckKind.None,
      },
    },
  ])('should hold the check when $condition', ({ command, expected }) => {
    // Act
    const check = CheckState.create(command);

    // Assert
    expect(check).toStrictEqual(expected);
  });

  it.each([
    {
      check: CheckState.create('bun run check'),
      command: 'bun run check',
      condition: 'it is named',
    },
    {
      check: CheckState.create(),
      command: undefined,
      condition: 'none is named',
    },
    {
      check: CheckState.unparsed(),
      command: undefined,
      condition: 'constitution.yaml does not parse',
    },
  ])('should give the command $command when $condition', ({ check, command }) => {
    // Act
    const given = CheckState.commandOf(check);

    // Assert
    expect(given).toBe(command);
  });
});
