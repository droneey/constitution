#!/usr/bin/env -S bun --no-env-file
import { runDesignTokens } from '#/root';

import resolver from '../../../tokens/design.resolver.json' with { type: 'json' };

process.exitCode = await runDesignTokens({
  args: process.argv.slice(2),
  resolver,
  resolverUrl: new URL(import.meta.resolve('../../../tokens/design.resolver.json')),
  workingFolderPath: process.cwd(),
  writeError: (text) => {
    process.stderr.write(text);
  },
});
