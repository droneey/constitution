import { describe, expect, it } from 'bun:test';

import { ShellCommand } from '../shell-command.value-object';

describe('ShellCommand.runsCheck', () => {
  it.each([
    {
      command: 'constitution run check',
      condition: 'the command is the check',
      isCheck: true,
    },
    {
      command: 'constitution run check --verbose',
      condition: 'the check takes its options',
      isCheck: true,
    },
    {
      command: 'constitution run check; echo done',
      condition: 'the check opens the command and a semicolon ends it',
      isCheck: true,
    },
    {
      command: 'cd app && constitution run check | tee log',
      condition: 'the check follows &&',
      isCheck: true,
    },
    {
      command: 'cd app;constitution run check',
      condition: 'the check follows a semicolon with no blank',
      isCheck: true,
    },
    {
      command: 'bun run constitution run check',
      condition: 'bun run runs the check',
      isCheck: true,
    },
    {
      command: 'bunx constitution run check',
      condition: 'bunx runs the check',
      isCheck: true,
    },
    {
      command: 'npx constitution run check',
      condition: 'npx runs the check',
      isCheck: true,
    },
    {
      command: 'cd app && mise exec -- constitution run check',
      condition: 'mise exec runs the check after &&',
      isCheck: true,
    },
    {
      command: 'constitution run checkout',
      condition: 'the command only starts with the check',
      isCheck: false,
    },
    {
      command: 'echo constitution run check',
      condition: 'the check follows a blank',
      isCheck: false,
    },
    {
      command: 'bun run check',
      condition: "a package's own script is run",
      isCheck: false,
    },
    {
      command: '',
      condition: 'the command is empty',
      isCheck: false,
    },
  ])('should say $isCheck when $condition', ({ command, isCheck }) => {
    // Act
    const answer = ShellCommand.runsCheck(command);

    // Assert
    expect(answer).toBe(isCheck);
  });
});
