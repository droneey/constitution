import { join } from 'node:path';

import { pluginFingerprintOf } from '#/libs/claude-plugin';
import { readModelFile } from '#/libs/model-file';

import type { PluginRegistry } from '../../application/contracts';
import type { InstalledPlugin } from '../../domain/installed-plugin/entities';
import { installedPluginsModel, packageModel } from './models';

const PLUGIN = 'constitution@droneey';
const MANIFEST_NAME = 'package.json';
const installedFile = join('plugins', 'installed_plugins.json');

interface ClaudePluginRegistryInput {
  readonly configFolder: string;
  readonly pluginRoot: string | undefined;
}

// Why: Claude Code names the root it runs the plugin's hooks from when it has one; otherwise the
// plugin is looked up in the record it keeps under configFolder.
const createClaudePluginRegistry = (input: ClaudePluginRegistryInput): PluginRegistry => ({
  installed: (): InstalledPlugin | undefined => {
    const root =
      input.pluginRoot ??
      readModelFile({
        model: installedPluginsModel,
        parse: JSON.parse,
        path: join(input.configFolder, installedFile),
      })?.plugins.get(PLUGIN)?.[0]?.installPath;
    const version =
      root === undefined
        ? undefined
        : readModelFile({
            model: packageModel,
            parse: JSON.parse,
            path: join(root, MANIFEST_NAME),
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
