import { join } from 'node:path';

import { describe, expect, it } from 'bun:test';

import {
  DiagnosticsSettingError,
  DiagnosticsSettingFailure,
} from '../diagnostics-setting.error.ts';

const goldenFilePath = join(import.meta.dir, 'diagnostics-setting.error.golden.txt');

describe('DiagnosticsSettingError', () => {
  it('should tell each failure by the message the golden file shows for its code', async () => {
    // Act
    const messages = [
      new DiagnosticsSettingError({
        code: DiagnosticsSettingFailure.Malformed,
        problemPaths: [
          'diagnosticsTextArguments.info',
          'diagnosticsTextArguments.option',
        ],
      }),
    ]
      .map(({ message }) => `${message}\n`)
      .join('');

    // Assert
    expect(messages).toBe(await Bun.file(goldenFilePath).text());
  });
});
