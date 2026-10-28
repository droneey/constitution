import { describe, expect, it } from 'bun:test';

import { pythonPackage, runTool, widestAppliedUnit } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

const functionOf = (steps: number): string =>
  [
    'def level(value: int) -> int:',
    '  """Count the steps the value passes."""',
    '  found = 0',
    ...Array.from(
      {
        length: steps,
      },
      (_step, index) => `  if value > ${String(index)}:\n    found += 1`,
    ),
    '  return found',
    '',
  ].join('\n');

const complexityStatus = async (steps: number): Promise<number> =>
  (
    await runTool({
      command: [
        uvBinary('complexipy'),
        'src',
      ],
      folder: widestAppliedUnit('complexipy', {
        files: {
          ...pythonPackage,
          'src/unit/levels.py': `"""Levels."""\n\n\n${functionOf(steps)}`,
        },
      }),
    })
  ).status;

// Why: complexipy takes a key it does not know without a word, so the limit the presets set has a
// function on each side of it.
describe("the configuration complexipy's presets write", () => {
  it.each([
    {
      condition: 'its complexity reaches the limit',
      status: 0,
      steps: 15,
    },
    {
      condition: 'its complexity passes the limit',
      status: 1,
      steps: 16,
    },
  ])('should end with $status on a function when $condition', async ({ status, steps }) => {
    // Act
    const ended = await complexityStatus(steps);

    // Assert
    expect(ended).toBe(status);
  });
});
