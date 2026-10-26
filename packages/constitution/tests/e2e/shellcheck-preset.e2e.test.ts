import { describe, expect, it } from 'bun:test';

import { analyseScript, unitTasks } from './shellcheck-preset.fixtures';

describe('the ShellCheck preset', () => {
  it('should accept a script that quotes, checks and stops on every failure', () => {
    // Arrange
    const script = [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      'name="${1:-world}"',
      'today="$(date +%F)"',
      'printf "%s %s\\n" "${name}" "${today}"',
      '',
    ].join('\n');

    // Act
    const analysis = analyseScript(script);

    // Assert
    expect(analysis).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it('should report a safe variable unquoted, a masked return and errexit suppressed by the optional checks it enables', () => {
    // Arrange
    const script = [
      '#!/bin/sh',
      'set -e',
      'check() {',
      '  return 1',
      '}',
      'if check; then',
      '  :',
      'fi',
      'name=x',
      'printf "%s\\n" $name',
      'printf "%s\\n" "$(date)"',
      '',
    ].join('\n');

    // Act
    const analysis = analyseScript(script);

    // Assert
    expect(analysis).toStrictEqual({
      codes: [
        2248,
        2310,
        2312,
      ],
      exitCode: 1,
    });
  });
});

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
});
