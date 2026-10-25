import { fileURLToPath } from 'node:url';

import { join } from '../../.droneey/constitution/presets/typescript/join.mjs';
import architectureCore from '../../.droneey/constitution/presets/typescript/stryker/architecture/core.mjs';
import architectureTanstackStart from '../../.droneey/constitution/presets/typescript/stryker/architecture/tanstack-start.mjs';
import bunTest from '../../.droneey/constitution/presets/typescript/stryker/foundation/bun-test.mjs';
import core from '../../.droneey/constitution/presets/typescript/stryker/foundation/core.mjs';
import mise from '../../.droneey/constitution/presets/typescript/stryker/foundation/mise.mjs';
import self from '../../.droneey/constitution/presets/typescript/stryker/foundation/self.mjs';
import tanstackRouter from '../../.droneey/constitution/presets/typescript/stryker/foundation/tanstack-router.mjs';
import tanstackStart from '../../.droneey/constitution/presets/typescript/stryker/foundation/tanstack-start.mjs';
import workspace from '../../.droneey/constitution/presets/typescript/stryker/foundation/workspace.mjs';

// Stryker has no extends, so the parts are joined.
export default {
  ...join(
    self,
    core,
    workspace,
    bunTest,
    mise,
    tanstackRouter,
    tanstackStart,
    architectureCore,
    architectureTanstackStart,
    // the project's own settings, joined after the parts
    {
      mutate: [
        // the server's handlers and the source over the collections fumadocs-mdx generates at build
        // time, which no spec can load; the built site proves them
        '!src/root/routes/**/*.ts',
        '!src/features/content/adapters/fumadocs/source.adapter.ts',
        // the titles and icons the site chose, which a spec could only restate
        '!src/features/content/adapters/fumadocs/repository/folders.constants.ts',
        '!src/features/content/adapters/fumadocs/repository/navigation-icons.constants.ts',
      ],
    },
  ),
  // this repository runs the mutation check from its source, not from the archive's build
  plugins: [
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/runner')),
    fileURLToPath(import.meta.resolve('@droneey/mutation-check/ignorers')),
  ],
};
