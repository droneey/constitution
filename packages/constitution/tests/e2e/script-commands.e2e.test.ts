import { describe, expect, it } from 'bun:test';

import { analyseScript, exitCodeBesideDeletedFile, unitTasks } from './script-commands.fixtures';

describe('the commands of the scripts the presets give', () => {
  it.each([
    ...unitTasks(),
  ])('should pass ShellCheck for the script $task', ({ run }) => {
    // Act
    const analysis = analyseScript(run);

    // Assert
    expect(analysis).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it.each([
    'check:shell',
    'check:shell-format',
  ])('should pass %s when a tracked shell file is deleted before the check', (task) => {
    // Act
    const exitCode = exitCodeBesideDeletedFile(task);

    // Assert
    expect(exitCode).toBe(0);
  });
});
