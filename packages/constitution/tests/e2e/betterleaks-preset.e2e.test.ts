import { describe, expect, it } from 'bun:test';

import { passwordPackage, scanStaged, token } from './betterleaks-preset.fixtures';

describe('the betterleaks preset', () => {
  it('should stop the commit when a staged file holds a token', () => {
    // Arrange
    const project = {
      files: {
        'config.ts': `export const token = '${token}';\n`,
      },
    };

    // Act
    const { exitCode } = scanStaged(project);

    // Assert
    expect(exitCode).toBe(1);
  });

  it('should keep the token out of the report when it stops the commit', () => {
    // Arrange
    const project = {
      files: {
        'config.ts': `export const token = '${token}';\n`,
      },
    };

    // Act
    const { output } = scanStaged(project);

    // Assert
    expect(output).not.toContain(token);
  });

  it.each([
    {
      condition: 'bun.lock names a dependency after a password',
      files: {
        'bun.lock': `{\n  "packages": {\n    "@inquirer/prompts": ["@inquirer/prompts@8.7.2", "", { "dependencies": {\n      "${passwordPackage}": "^5.2.2",\n    } }],\n  }\n}\n`,
      },
    },
  ])('should let the commit through when $condition', ({ files }) => {
    // Arrange
    const project = {
      files,
    };

    // Act
    const { exitCode } = scanStaged(project);

    // Assert
    expect(exitCode).toBe(0);
  });
});
