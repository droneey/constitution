import { describe, expect, it } from 'bun:test';

import { runTool, widestAppliedUnit } from './preset-load.fixtures';

const PROBE = 'probe';

// Why: Bun takes a key of its bunfig.toml it does not know without a word, so each setting of Bun's
// own the presets write has a run it must change. How old a release install takes needs the
// registry, which no spec reaches.
describe("the configuration Bun's presets write", () => {
  it("should run a script's node as Bun when a unit follows every block Bun is configured for", async () => {
    // Arrange
    const folder = widestAppliedUnit('bun', {
      files: {
        'package.json': `${JSON.stringify({
          name: 'unit',
          scripts: {
            [PROBE]: 'node -e "process.stdout.write(typeof Bun)"',
          },
        })}\n`,
      },
    });

    // Act
    const run = await runTool({
      command: [
        process.execPath,
        'run',
        '--silent',
        PROBE,
      ],
      folder,
    });

    // Assert
    expect(run.stdout).toBe('object');
  });
});
