import { Version } from '#/kernel/value-objects';

import type { InstalledPlugin, PartDiagnosis } from '../../../../../../domain/entities';
import { Diagnosis } from '../../../../../../domain/entities';

interface ReportPluginInput {
  readonly executable: Version;
  readonly fingerprint: string | undefined;
  readonly plugin: InstalledPlugin | undefined;
}

const reportPlugin = (input: ReportPluginInput): PartDiagnosis => {
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

export { reportPlugin };
