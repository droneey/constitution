// biome-ignore-all lint/correctness/noUndeclaredDependencies: a template; the project that copies it declares Lingui
import { basename, relative } from 'node:path';

import { plugin } from 'bun';

import { createCompiledCatalog, getCatalogForFile, getCatalogs } from '@lingui/cli/api';
import { getConfig } from '@lingui/conf';
import { mapMacroOptions, transform } from '@lingui/native-tools';

const config = getConfig();
const macroPackages = [
  ...config.macro.corePackage,
  ...config.macro.jsxPackage,
];

const importsMacro = (source: string): boolean =>
  macroPackages.some((name) => source.includes(`'${name}'`) || source.includes(`"${name}"`));

const SOURCE_LOADERS = [
  'js',
  'jsx',
  'ts',
  'tsx',
] as const;

plugin({
  name: 'lingui',
  setup(build) {
    for (const loader of SOURCE_LOADERS) {
      build.onLoad(
        {
          filter: new RegExp(`/src/.*\\.${loader}$`),
        },
        async ({ path }) => {
          const source = await Bun.file(path).text();
          if (!importsMacro(source)) {
            return {
              contents: source,
              loader,
            };
          }
          const { code } = await transform(source, basename(path), {
            macro: {
              descriptorFields: 'all',
              ...mapMacroOptions(config),
            },
          });
          return {
            contents: code,
            loader,
          };
        },
      );
    }
    build.onLoad(
      {
        filter: /\.po$/,
      },
      async ({ path }) => {
        const found = getCatalogForFile(relative(config.rootDir, path), await getCatalogs(config));
        if (!found) {
          throw new Error(`${path} belongs to no catalog of lingui.config.ts`);
        }
        const { messages } = await found.catalog.getTranslations(found.locale, {
          fallbackLocales: config.fallbackLocales,
          sourceLocale: config.sourceLocale,
        });
        const { source } = createCompiledCatalog(found.locale, messages, {
          namespace: 'es',
        });
        return {
          contents: source,
          loader: 'js',
        };
      },
    );
  },
});
