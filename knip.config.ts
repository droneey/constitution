import architecture from './.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import architectureTanstackStart from './.droneey/constitution/presets/typescript/knip/architecture/tanstack-start.mjs';
import betterleaks from './.droneey/constitution/presets/typescript/knip/foundation/betterleaks.mjs';
import core from './.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
import hadolint from './.droneey/constitution/presets/typescript/knip/foundation/hadolint.mjs';
import mise from './.droneey/constitution/presets/typescript/knip/foundation/mise.mjs';
import osvScanner from './.droneey/constitution/presets/typescript/knip/foundation/osv-scanner.mjs';
import rumdl from './.droneey/constitution/presets/typescript/knip/foundation/rumdl.mjs';
import shellcheck from './.droneey/constitution/presets/typescript/knip/foundation/shellcheck.mjs';
import shfmt from './.droneey/constitution/presets/typescript/knip/foundation/shfmt.mjs';
import stryker from './.droneey/constitution/presets/typescript/knip/foundation/stryker.mjs';
import tanstackStart from './.droneey/constitution/presets/typescript/knip/foundation/tanstack-start.mjs';
import uv from './.droneey/constitution/presets/typescript/knip/foundation/uv.mjs';
import yamllint from './.droneey/constitution/presets/typescript/knip/foundation/yamllint.mjs';

export default {
  workspaces: {
    '.': {
      entry: [],
      project: [],
    },
    'apps/docs': {
      entry: [
        ...core.entry,
        ...tanstackStart.entry,
        ...architecture.entry,
        ...architectureTanstackStart.entry,
        // the collections fumadocs-mdx reads, and the file routes the router finds by their folder
        'source.config.ts!',
        'src/root/routes/**/*.{ts,tsx}!',
      ],
      project: core.project,
      // its plugin takes source.config.ts for a development file, which the build runs
      fumadocs: false,
      ignore: [
        'src/root/routeTree.gen.ts',
      ],
      ignoreDependencies: [
        ...stryker.ignoreDependencies,
        // root/app.css imports them, which knip does not read
        '@fontsource-variable/geist',
        '@fontsource-variable/geist-mono',
        'tailwindcss',
        // the mutation check runs Stryker from node_modules
        '@stryker-mutator/core',
        '@swc/core',
      ],
    },
    'packages/constitution': {
      entry: [
        ...core.entry,
        ...architecture.entry,
      ],
      project: core.project,
      // The end-to-end specs run these from node_modules/.bin.
      ignoreDependencies: [
        ...stryker.ignoreDependencies,
        '@biomejs/biome',
        '@stryker-mutator/core',
        '@swc/core',
        'dclint',
        'syncpack',
      ],
    },
    'packages/mutation-check/languages/typescript': {
      entry: [
        'src/main.ts!',
        'src/runner.ts!',
        'src/ignorers.ts!',
      ],
      project: [
        'src/**/*.ts!',
        '!src/**/__tests__/**!',
      ],
      ignoreDependencies: [
        ...stryker.ignoreDependencies,
      ],
    },
  },
  ignoreBinaries: [
    ...betterleaks.ignoreBinaries,
    ...hadolint.ignoreBinaries,
    ...mise.ignoreBinaries,
    ...osvScanner.ignoreBinaries,
    ...uv.ignoreBinaries,
    ...rumdl.ignoreBinaries,
    ...shellcheck.ignoreBinaries,
    ...shfmt.ignoreBinaries,
    ...yamllint.ignoreBinaries,
    'mkfifo',
    'renovate-config-validator',
    'stryker',
  ],
};
