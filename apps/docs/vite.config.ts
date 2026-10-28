import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import constitutionManifest from '@droneey/constitution/package.json' with { type: 'json' };
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import { z } from 'zod';

const manifestShape = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});

const { version: constitutionVersion } = manifestShape.parse(constitutionManifest);

export default defineConfig({
  // the site lives under its version beside the other releases', in the dev server too
  base: `/v${constitutionVersion}/`,
  server: {
    port: 3000,
    watch: {
      // Stryker's sandboxes copy the app, tsconfig.json included, and a changed
      // tsconfig.json restarts the server under the page being served
      ignored: [
        '**/.stryker-tmp/**',
        '**/.tsc-cache/**',
        '**/coverage/**',
      ],
    },
  },
  define: {
    'import.meta.env.VITE_CONSTITUTION_VERSION': JSON.stringify(constitutionVersion),
  },
  plugins: [
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      // the wiring declares Start's request middleware, so it is the start entry
      start: {
        entry: 'root/wiring.ts',
      },
      router: {
        entry: 'root/router.ts',
        generatedRouteTree: 'root/routeTree.gen.ts',
        routesDirectory: 'root/routes',
      },
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },
      pages: [
        {
          path: '/',
        },
        {
          path: '/docs',
        },
        {
          path: '/api/navigation',
        },
        {
          path: '/api/pages',
        },
        {
          path: '/api/search',
        },
        {
          path: 'llms-full.txt',
        },
        {
          path: 'llms.txt',
        },
      ],
    }),
    react(),
    babel({
      presets: [
        reactCompilerPreset(),
      ],
    }),
    nitro(),
  ],
  resolve: {
    alias: {
      tslib: 'tslib/tslib.es6.js',
    },
  },
});
