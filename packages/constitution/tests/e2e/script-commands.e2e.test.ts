import { describe, expect, it } from 'bun:test';

import {
  analyseScript,
  exitCodeBesideDeletedFile,
  filesHandedBesideMember,
  formatCheckOf,
  shippedScripts,
  strictAnalysisOf,
  unitTasks,
} from './script-commands.fixtures';

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

  it('should hand the command the shell scripts git keeps but those of a member and those it ignores', () => {
    // Act
    const files = filesHandedBesideMember('member');

    // Assert
    expect(files).toStrictEqual([
      'kept.sh',
      'untracked.bash',
    ]);
  });
});

describe('the shell scripts the presets ship', () => {
  it.each([
    ...shippedScripts(),
  ])('should pass ShellCheck with every optional check for %s', (script) => {
    // Act
    const analysis = strictAnalysisOf(script);

    // Assert
    expect(analysis).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it.each([
    ...shippedScripts(),
  ])('should stand as shfmt simplifies and formats %s', (script) => {
    // Act
    const check = formatCheckOf(script);

    // Assert
    expect(check).toStrictEqual({
      difference: '',
      exitCode: 0,
    });
  });
});
