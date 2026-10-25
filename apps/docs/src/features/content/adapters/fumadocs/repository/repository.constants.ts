/** the same folders in blocks/ and on the site */
// Stryker disable StringLiteral: the site's loader and build read the layers, which no spec loads; the specs see contexts/ through either of its layers
const BLOCK_LAYERS: readonly string[] = [
  'core',
  'domains',
  'contexts/platforms',
  'contexts/languages',
  'implementations',
] as const;
// Stryker restore StringLiteral

const BLOCKS_FOLDER = 'packages/constitution/blocks/';

const DOCS_FOLDER = 'docs/';

const README_FILE = 'README.md';

const PROJECT_FILE = 'PROJECT.md';

const QUICK_START = 'quick-start';

/** the page made of PROJECT.md's glossary, and that section's anchor */
const GLOSSARY = 'glossary';

const SITE_DOCUMENTS: Readonly<Record<string, string>> = {
  'CONTRIBUTING.md': 'contributing',
  'DECISIONS.md': 'decisions',
} as const;

/** contexts/ holds two layers, and the sidebar one folder for them */
const siteLayers: readonly string[] = [
  ...new Set(BLOCK_LAYERS.map((layer) => layer.replace(/\/.*/, ''))),
];

export {
  BLOCK_LAYERS,
  BLOCKS_FOLDER,
  DOCS_FOLDER,
  GLOSSARY,
  PROJECT_FILE,
  QUICK_START,
  README_FILE,
  SITE_DOCUMENTS,
  siteLayers,
};
