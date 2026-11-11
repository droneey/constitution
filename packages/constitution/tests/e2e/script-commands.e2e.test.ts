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
    {
      task: 'check:lint',
      tool: 'shellcheck',
    },
    {
      task: 'check:format',
      tool: 'shfmt',
    },
  ])(
    'should pass $tool of $task when a tracked shell file is deleted before the check',
    (command) => {
      // Act
      const exitCode = exitCodeBesideDeletedFile(command);

      // Assert
      expect(exitCode).toBe(0);
    },
  );

  it.each([
    {
      files: [
        'kept.sh',
        'untracked.bash',
      ],
      kind: 'shell' as const,
    },
    {
      files: [
        'kept.yaml',
        'untracked.yml',
      ],
      kind: 'yaml' as const,
    },
  ])(
    'should hand the command the $kind files git keeps but those of a member and those it ignores',
    ({ files, kind }) => {
      // Act
      const handed = filesHandedBesideMember({
        kind,
        member: 'member',
      });

      // Assert
      expect(handed).toStrictEqual(files);
    },
  );
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
