import architectureCore from '../../.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import architectureTanstackRouter from '../../.droneey/constitution/presets/typescript/knip/architecture/tanstack-router.mjs';
import architectureTanstackStart from '../../.droneey/constitution/presets/typescript/knip/architecture/tanstack-start.mjs';
import betterleaks from '../../.droneey/constitution/presets/typescript/knip/foundation/betterleaks.mjs';
import core from '../../.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import hadolint from '../../.droneey/constitution/presets/typescript/knip/foundation/hadolint.mjs';
import mise from '../../.droneey/constitution/presets/typescript/knip/foundation/mise.mjs';
import osvScanner from '../../.droneey/constitution/presets/typescript/knip/foundation/osv-scanner.mjs';
import rumdl from '../../.droneey/constitution/presets/typescript/knip/foundation/rumdl.mjs';
import shellcheck from '../../.droneey/constitution/presets/typescript/knip/foundation/shellcheck.mjs';
import shfmt from '../../.droneey/constitution/presets/typescript/knip/foundation/shfmt.mjs';
import stryker from '../../.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import tanstackStart from '../../.droneey/constitution/presets/typescript/knip/foundation/tanstack-start.mjs';
import uv from '../../.droneey/constitution/presets/typescript/knip/foundation/uv.mjs';
import yamllint from '../../.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';
import workflowLefthook from '../../.droneey/constitution/presets/typescript/knip/workflow/lefthook.mjs';

// knip has no extends: the parts are joined, every list after the lists before it and
// every table merged into the one before it.
type Settings = Record<string, unknown>;

const isRecord = (setting: unknown): setting is Settings =>
  typeof setting === 'object' && setting !== null && !Array.isArray(setting);
const join = (...parts: readonly Settings[]): Settings => {
  const joined: Settings = {};

  for (const next of parts) {
    for (const [key, setting] of Object.entries(next)) {
      const before = joined[key];

      if (Array.isArray(before) && Array.isArray(setting)) {
        joined[key] = [
          ...before,
          ...setting,
        ];
      } else if (isRecord(before) && isRecord(setting)) {
        joined[key] = {
          ...before,
          ...setting,
        };
      } else {
        joined[key] = setting;
      }
    }
  }

  return joined;
};

export default join(
  core,
  betterleaks,
  hadolint,
  mise,
  osvScanner,
  rumdl,
  shellcheck,
  shfmt,
  stryker,
  tanstackStart,
  uv,
  yamllint,
  architectureCore,
  architectureTanstackRouter,
  architectureTanstackStart,
  workflowLefthook,
  // the project's own settings, joined after the parts
  {
    entry: [
      // the collections fumadocs-mdx reads
      'source.config.ts!',
    ],
    // its plugin takes source.config.ts for a development file, which the build runs
    fumadocs: false,
    ignore: [
      'src/root/routeTree.gen.ts',
    ],
    ignoreDependencies: [
      // root/app.css imports them, which knip does not read
      '@fontsource-variable/geist',
      '@fontsource-variable/geist-mono',
      'tailwindcss',
      // the mutation check runs Stryker from node_modules
      '@stryker-mutator/core',
      '@swc/core',
    ],
  },
);
