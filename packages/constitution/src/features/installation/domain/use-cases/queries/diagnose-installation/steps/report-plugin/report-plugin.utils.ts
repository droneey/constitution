import { Version } from '#/kernel/value-objects';

import type { InstalledPlugin, PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

// The plugin is only glue to this program: it matters only when its own files differ from those this
// program was built with, and then its version says which is older.
const pluginReport = (input: {
  fingerprint: string | undefined;
  plugin: InstalledPlugin | undefined;
  program: Version;
}): PartDiagnosis => {
  const { plugin, program } = input;

  if (plugin === undefined) {
    return {
      kind: Diagnosis.PluginMissing,
    };
  }

  if (plugin.fingerprint !== undefined && plugin.fingerprint === input.fingerprint) {
    return {
      kind: Diagnosis.PluginMatches,
      plugin: plugin.version,
      program,
    };
  }

  const order = Version.compare(plugin.version, program);

  if (order === 0) {
    return {
      kind: Diagnosis.PluginDiffersAtItsVersion,
      program,
    };
  }

  return {
    kind: order === -1 ? Diagnosis.PluginOlder : Diagnosis.PluginNewer,
    plugin: plugin.version,
    program,
  };
};

export { pluginReport };
