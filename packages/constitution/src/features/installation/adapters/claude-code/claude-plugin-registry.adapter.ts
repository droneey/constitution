import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ZodType } from 'zod';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { pluginFingerprintOf } from '#/libs/claude-plugin';
import { isSystemError } from '#/libs/system-error';

import type { PluginRegistry } from '../../domain/contracts';
import type { InstalledPlugin } from '../../domain/entities';
import { installedPluginsModel, packageModel } from './models';

const PLUGIN = 'constitution@droneey';
const MANIFEST = 'package.json';
const installedFile = join('plugins', 'installed_plugins.json');

// A file that is missing, unreadable or no JSON of the shape reads as undefined.
const readJson = <T>(input: { model: ZodType<T>; path: string }): T | undefined => {
  const parsed = attempted<unknown>({
    effect: () => JSON.parse(readFileSync(input.path).toString()),
    // Stryker disable next-line ConditionalExpression: reading a file fails only by the system and parsing it only by its syntax, so no other failure reaches here
    isRecognised: (error: unknown): boolean => isSystemError(error) || isSyntaxError(error),
  });
  const read = input.model.safeParse(parsed);

  return read.success ? read.data : undefined;
};

/**
 * pluginRoot is the root Claude Code runs the plugin's hooks from, when it names one; otherwise the
 * plugin is looked up in the record Claude Code keeps under configFolder.
 */
const createClaudePluginRegistry = (input: {
  configFolder: string;
  pluginRoot: string | undefined;
}): PluginRegistry => ({
  installed: (): InstalledPlugin | undefined => {
    const root =
      input.pluginRoot ??
      readJson({
        model: installedPluginsModel,
        path: join(input.configFolder, installedFile),
      })?.plugins[PLUGIN]?.[0]?.installPath;
    const version =
      root === undefined
        ? undefined
        : readJson({
            model: packageModel,
            path: join(root, MANIFEST),
          })?.version;

    // Stryker disable next-line ConditionalExpression: with no root no manifest is read either, which reads as no plugin
    if (root === undefined || version === undefined) {
      return undefined;
    }

    const fingerprint = pluginFingerprintOf(root);

    return fingerprint === undefined
      ? {
          version,
        }
      : {
          fingerprint,
          version,
        };
  },
});

export { createClaudePluginRegistry };
