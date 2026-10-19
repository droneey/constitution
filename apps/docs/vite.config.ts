import { readFileSync } from 'node:fs';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import { z } from 'zod';

// the site builds from its own folder, two levels below the repository's root
const CONSTITUTION_MANIFEST = new URL('../../packages/constitution/package.json', import.meta.url);

const manifestShape = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});

const { version: constitutionVersion } = manifestShape.parse(
  JSON.parse(readFileSync(CONSTITUTION_MANIFEST, 'utf8')),
);

export default defineConfig({
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
      router: {
        entry: 'root/router.tsx',
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
