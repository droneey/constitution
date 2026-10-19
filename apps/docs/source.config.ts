// The collections of the repository's Markdown, which fumadocs-mdx compiles at build time: the
// server lists the pages from them, and the browser loads a page's body from them.
import type { RehypeCodeOptions } from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import type { PluggableList } from 'unified';
import { z } from 'zod';

import { docsRoute } from '#/shared/constants';

import { pseudo } from './src/features/content/adapters/fumadocs/pseudo.grammar';
import {
  blocksOptionsOf,
  remarkBlocks,
  remarkDiagrams,
  remarkDropHtml,
  remarkDropSummary,
  remarkDropTitle,
  remarkRelease,
  remarkRepoLinks,
  remarkSections,
} from './src/features/content/adapters/fumadocs/remark';
import {
  BLOCK_LAYERS,
  documentIconOf,
  GLOSSARY,
  guideIconOf,
  ICONS,
  inRepository,
  QUICK_START,
  releaseOf,
  sectionSummaryOf,
  sidebarOf,
  taglineOf,
} from './src/features/content/adapters/fumadocs/repository';
import { markdownSchema } from './src/features/content/adapters/fumadocs/schema.adapter';

const QUICK_START_SECTION = 'Quick start';

const DOCUMENTATION_SECTION = 'Documentation';

const codeOptions: RehypeCodeOptions = {
  langs: [
    'ts',
    'tsx',
    'json',
    'yaml',
    'toml',
    'bash',
    'md',
    pseudo,
  ],
  themes: {
    dark: 'catppuccin-mocha',
    light: 'github-light-high-contrast',
  },
};

const markdownOptions = (remarkPlugins: PluggableList): ReturnType<typeof applyMdxPreset> =>
  applyMdxPreset({
    rehypeCodeOptions: codeOptions,
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
          baseUrl: docsRoute,
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
    mdxOptions: markdownOptions([]),
  },
});

const overview = defineDocs({
  dir: '../..',
  // the repository's root holds no sidebar, only the README and the tools' configurations
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
      markdownSchema(() => ICONS[''])(context).extend({
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
      markdownSchema(() => ICONS[`/${QUICK_START}`])(context).extend({
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
    schema: (context) =>
      markdownSchema(() => ICONS[`/${GLOSSARY}`])(context).extend({
        description: z.string().default(sidebarOf(docsRoute).descriptions.get(GLOSSARY) ?? ''),
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
  dir: '../../packages/constitution/blocks',
  docs: {
    async: true,
    files: [
      '**/*.md',
    ],
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: markdownSchema(() => undefined),
    mdxOptions: async (environment) => {
      const options = blocksOptionsOf({
        baseUrl: docsRoute,
        blocks: inRepository('packages/constitution/blocks'),
        examples: 'content/examples',
        folders: Object.values(BLOCK_LAYERS),
      });

      return await applyMdxPreset({
        rehypeCodeOptions: codeOptions,
        remarkPlugins: (plugins) => [
          [
            remarkBlocks,
            options,
          ],
          [
            remarkRepoLinks,
            {
              baseUrl: docsRoute,
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
