import { Version } from '#/kernel/value-objects';

import type { InstalledPlugin, PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

interface PluginReportInput {
  readonly executable: Version;
  readonly fingerprint: string | undefined;
  readonly plugin: InstalledPlugin | undefined;
}

// The plugin is only glue to this executable: it matters only when its own files differ from those
// this executable was built with, and then its version says which is older.
const pluginReport = (input: PluginReportInput): PartDiagnosis => {
  const { executable, plugin } = input;

  if (plugin === undefined) {
    return {
      kind: Diagnosis.PluginMissing,
    };
  }

  if (plugin.fingerprint !== undefined && plugin.fingerprint === input.fingerprint) {
    return {
      executable,
      kind: Diagnosis.PluginMatches,
      plugin: plugin.version,
    };
  }

  const order = Version.compare(plugin.version, executable);

  if (order === 0) {
    return {
      executable,
      kind: Diagnosis.PluginDiffersAtItsVersion,
    };
  }

  return {
    executable,
    kind: order === -1 ? Diagnosis.PluginOlder : Diagnosis.PluginNewer,
    plugin: plugin.version,
  };
};

export { pluginReport };
