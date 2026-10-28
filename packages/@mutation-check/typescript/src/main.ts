#!/usr/bin/env -S bun --no-env-file
import { AbsolutePath } from '#/kernel/value-objects';
import { ExitCode, failureReportOf, runMutationCheck } from '#/root';

try {
  process.exitCode = await runMutationCheck({
    args: process.argv.slice(2),
    environment: process.env,
    unitFolderPath: AbsolutePath.create(process.cwd()),
    writeError: (text) => {
      process.stderr.write(text);
    },
    writeOutput: (text) => {
      process.stdout.write(text);
    },
  });
} catch (error) {
  process.stderr.write(failureReportOf(error));
  process.exitCode = ExitCode.Stopped;
}
