import type { RehypeCodeOptions } from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import type { PluggableList } from 'unified';
import { z } from 'zod';

import { DOCS_ROUTE } from '#/shared/constants';

import { PSEUDO } from './src/features/content/adapters/fumadocs/pseudo-grammar.constants';
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
  remarkTerms,
} from './src/features/content/adapters/fumadocs/remark';
import {
  BLOCK_LAYERS,
  DOCUMENTATION_SECTION,
  documentIconOf,
  GLOSSARY,
  guideIconOf,
  ICONS_BY_ADDRESS,
  inRepository,
  QUICK_START,
  releaseOf,
  sectionSummaryOf,
  sidebarOf,
  taglineOf,
  termsOf,
} from './src/features/content/adapters/fumadocs/repository';
import { markdownSchema } from './src/features/content/adapters/fumadocs/schema.adapter';

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
        baseUrl: DOCS_ROUTE,
        blocks: inRepository('packages/constitution/blocks'),
        examples: 'content/examples',
        folders: BLOCK_LAYERS,
      });

      return await applyMdxPreset({
        rehypeCodeOptions: CODE_OPTIONS,
        remarkPlugins: (plugins) => [
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
