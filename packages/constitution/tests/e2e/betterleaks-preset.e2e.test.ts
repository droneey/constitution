import { describe, expect, it } from 'bun:test';

import { configuredScan, passwordPackage, scanStaged, token } from './betterleaks-preset.fixtures';

const stagedToken = {
  files: {
    'config.ts': `export const token = '${token}';\n`,
  },
};

describe("the configuration betterleaks' presets write", () => {
  it('should load in betterleaks with no rule it warns of when a unit follows every block betterleaks is configured for', async () => {
    // Act
    const scan = await configuredScan();

    // Assert
    expect(scan).toStrictEqual({
      output: [],
      status: 0,
    });
  });

  it('should stop the commit when a staged file holds a token', () => {
    // Act
    const { exitCode } = scanStaged(stagedToken);

    // Assert
    expect(exitCode).toBe(1);
  });

  it('should keep the token out of the report when it stops the commit', () => {
    // Act
    const { output } = scanStaged(stagedToken);

    // Assert
    expect(output).not.toContain(token);
  });

  it('should let the commit through when bun.lock names a dependency after a password', () => {
    // Arrange
    const project = {
      files: {
        'bun.lock': `{\n  "packages": {\n    "@inquirer/prompts": ["@inquirer/prompts@8.7.2", "", { "dependencies": {\n      "${passwordPackage}": "^5.2.2",\n    } }],\n  }\n}\n`,
      },
    };

    // Act
    const { exitCode } = scanStaged(project);

    // Assert
    expect(exitCode).toBe(0);
  });
});
