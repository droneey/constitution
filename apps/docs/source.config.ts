import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

import type { RehypeCodeOptions } from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import type { PluggableList } from 'unified';
import { z } from 'zod';

import { AbsolutePath, BlockLayer } from '#/features/content';
import {
  blocksOptionsOf,
  DOCUMENTATION_SECTION,
  documentIconOf,
  GLOSSARY,
  guideIconOf,
  ICONS_BY_ADDRESS,
  markdownSchema,
  PSEUDO,
  QUICK_START,
  releaseOf,
  remarkBlocks,
  remarkDiagrams,
  remarkDropHtml,
  remarkDropSummary,
  remarkDropTitle,
  remarkRelease,
  remarkRepoLinks,
  remarkSections,
  remarkTermIds,
  remarkTerms,
  sectionSummaryOf,
  sidebarOf,
  taglineOf,
  termsOf,
} from '#/features/content/infrastructure/fumadocs-mdx';
import { DOCS_ROUTE } from '#/shared/constants';

const constitutionBlocksPath = AbsolutePath.create(
  join(
    dirname(createRequire(import.meta.url).resolve('@droneey/constitution/package.json')),
    'blocks',
  ),
);

const QUICK_START_SECTION = 'Quick start';

const CODE_OPTIONS: RehypeCodeOptions = {
  langs: [
    'ts',
    'tsx',
    'json',
    'yaml',
    'toml',
    'bash',
    'md',
    PSEUDO,
  ],
  themes: {
    dark: 'catppuccin-mocha',
    light: 'github-light-high-contrast',
  },
} as const;

const markdownOptions = (remarkPlugins: PluggableList): ReturnType<typeof applyMdxPreset> =>
  applyMdxPreset({
    rehypeCodeOptions: CODE_OPTIONS,
    /** @throws {SourceError} when the Constitution's package names no release version */
    remarkPlugins: (plugins) => [
      remarkDropTitle,
      ...remarkPlugins,
      [
        remarkRelease,
        {
          version: releaseOf(),
        },
      ],
      [
        remarkRepoLinks,
        {
          baseUrl: DOCS_ROUTE,
        },
      ],
      remarkDiagrams,
      ...plugins,
    ],
  });

const guide = defineDocs({
  dir: '../../docs',
  docs: {
    async: true,
    files: [
      '**/*.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: markdownSchema(guideIconOf),
    mdxOptions: markdownOptions([
      [
        remarkTerms,
        {
          terms: termsOf(DOCS_ROUTE),
        },
      ],
    ]),
  },
});

const overview = defineDocs({
  dir: '../..',
  // Why: the repository's root holds no sidebar, only the README and the tools' configurations.
  meta: {
    files: [
      'meta.json',
    ],
  },
  docs: {
    async: true,
    files: [
      'README.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    /** @throws {SourceError} when the brand holds no tagline */
    schema: (context) =>
      markdownSchema(() => ICONS_BY_ADDRESS[''])(context).extend({
        description: z.string().default(taglineOf()),
        title: z.string().default('Overview'),
      }),
    mdxOptions: markdownOptions([
      [
        remarkSections,
        {
          drop: [
            QUICK_START_SECTION,
            DOCUMENTATION_SECTION,
          ],
        },
      ],
      remarkDropHtml,
    ]),
  },
});

const quickStart = defineDocs({
  dir: '../..',
  meta: {
    files: [
      'meta.json',
    ],
  },
  docs: {
    async: true,
    files: [
      'README.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: (context) =>
      markdownSchema(() => ICONS_BY_ADDRESS[`/${QUICK_START}`])(context).extend({
        description: z.string().default(sectionSummaryOf(QUICK_START_SECTION) ?? ''),
        title: z.string().default(QUICK_START_SECTION),
      }),
    mdxOptions: markdownOptions([
      [
        remarkSections,
        {
          keep: QUICK_START_SECTION,
        },
      ],
      remarkDropSummary,
      remarkDropHtml,
    ]),
  },
});

const glossary = defineDocs({
  dir: '../..',
  meta: {
    files: [
      'meta.json',
    ],
  },
  docs: {
    async: true,
    files: [
      'PROJECT.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    /** @throws {SourceError} when the README has no Documentation section */
    schema: (context) =>
      markdownSchema(() => ICONS_BY_ADDRESS[`/${GLOSSARY}`])(context).extend({
        description: z.string().default(sidebarOf(DOCS_ROUTE).descriptions.get(GLOSSARY) ?? ''),
        title: z.string().default('Glossary'),
      }),
    mdxOptions: markdownOptions([
      [
        remarkSections,
        {
          keep: 'Glossary',
        },
      ],
    ]),
  },
});

const documents = defineDocs({
  dir: '../..',
  meta: {
    files: [
      'meta.json',
    ],
  },
  docs: {
    async: true,
    files: [
      'CONTRIBUTING.md',
      'DECISIONS.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: markdownSchema(documentIconOf),
    mdxOptions: markdownOptions([]),
  },
});

const blocks = defineDocs({
  dir: constitutionBlocksPath,
  docs: {
    async: true,
    files: [
      '**/*.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: markdownSchema(() => undefined),
    /** @throws {SourceError} when an example names no rule of the folders */
    mdxOptions: async (environment) => {
      const options = blocksOptionsOf({
        baseUrl: DOCS_ROUTE,
        blocksFolderPath: constitutionBlocksPath,
        examplesFolderPath: AbsolutePath.create(resolve('content/examples')),
        layers: Object.values(BlockLayer),
      });

      return await applyMdxPreset({
        rehypeCodeOptions: CODE_OPTIONS,
        remarkPlugins: (plugins) => [
          // Why: first, so the ids leave the summary the next step drops, whose source the page's
          // Markdown keeps.
          remarkTermIds,
          [
            remarkBlocks,
            options,
          ],
          [
            remarkRepoLinks,
            {
              baseUrl: DOCS_ROUTE,
            },
          ],
          remarkDiagrams,
          ...plugins,
        ],
      })(environment);
    },
  },
});

export { blocks, documents, glossary, guide, overview, quickStart };

export default defineConfig();
