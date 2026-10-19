import { statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { gitConfig } from '#/shared/constants';

import { pageSlugsOf } from '../../../domain/utils';

/** the site builds from its own folder; the path is resolved when asked, since the browser has none */
const inRepository = (path = ''): string => resolve('../..', path);

/** the same folders in blocks/ and on the site */
// Stryker disable StringLiteral: the site's loader and build read the layers, which no spec loads; the specs see contexts/ through either of its layers
const BLOCK_LAYERS: readonly string[] = [
  'core',
  'domains',
  'contexts/platforms',
  'contexts/languages',
  'implementations',
];
// Stryker restore StringLiteral

const QUICK_START = 'quick-start';

/** the page made of PROJECT.md's glossary, and that section's anchor */
const GLOSSARY = 'glossary';

const SITE_DOCUMENTS: Readonly<Record<string, string>> = {
  'CONTRIBUTING.md': 'contributing',
  'DECISIONS.md': 'decisions',
};

const DOCS_FOLDER = 'docs/';

const BLOCKS_FOLDER = 'packages/constitution/blocks/';

/** contexts/ holds two layers, and the sidebar one folder for them */
const SITE_LAYERS: readonly string[] = [
  ...new Set(BLOCK_LAYERS.map((layer) => layer.replace(/\/.*/, ''))),
];

const blockLayerOf = (path: string): string | undefined =>
  SITE_LAYERS.find((layer) => path === `${BLOCKS_FOLDER}${layer}`);

const MARKDOWN = '.md';

interface RepositoryPath {
  hash: string;
  path: string;
}

const githubAddressOf = (path: string): string => {
  const kind = statSync(inRepository(path), {
    throwIfNoEntry: false,
  })?.isDirectory()
    ? 'tree'
    : 'blob';

  return `https://github.com/${gitConfig.user}/${gitConfig.repo}/${kind}/main/${path}`;
};

/** a page where the site renders the file, GitHub's view where it does not */
const addressOf = (baseUrl: string, path: string, hash: string): string => {
  const anchor = hash === '' ? '' : `#${hash}`;

  if (path === 'README.md') {
    // a heading of the README opens with the brand's mark, which GitHub's anchor keeps as a hyphen
    const section = hash.replace(/^-/, '');

    if (section === QUICK_START) {
      return `${baseUrl}/${QUICK_START}`;
    }

    return section === '' ? baseUrl : `${baseUrl}#${section}`;
  }
  if (path.startsWith(DOCS_FOLDER) && path.endsWith(MARKDOWN)) {
    return `${baseUrl}/${path.slice(DOCS_FOLDER.length, -MARKDOWN.length)}${anchor}`;
  }
  if (path === 'PROJECT.md' && hash === GLOSSARY) {
    return `${baseUrl}/${GLOSSARY}`;
  }
  if (path in SITE_DOCUMENTS) {
    return `${baseUrl}/${SITE_DOCUMENTS[path]}${anchor}`;
  }

  const block = path.startsWith(BLOCKS_FOLDER) ? path.slice(BLOCKS_FOLDER.length) : undefined;

  if (block?.endsWith(MARKDOWN)) {
    return (
      [
        baseUrl,
        ...pageSlugsOf(block),
      ].join('/') + anchor
    );
  }

  return githubAddressOf(path) + anchor;
};

const repositoryPathOf = (from: string, url: string): RepositoryPath | undefined => {
  if (/^[a-z]+:/i.test(url) || url.startsWith('/')) {
    return undefined;
  }

  const [
    // Stryker disable next-line StringLiteral: a split holds at least one part, so the target's default is never read
    target = '',
    hash = '',
  ] = url.split('#');
  const path = relative(inRepository(), target === '' ? from : resolve(from, '..', target));

  return path.startsWith('..')
    ? undefined
    : {
        hash,
        path,
      };
};

export {
  addressOf,
  BLOCK_LAYERS,
  BLOCKS_FOLDER,
  blockLayerOf,
  GLOSSARY,
  inRepository,
  QUICK_START,
  repositoryPathOf,
  SITE_DOCUMENTS,
  SITE_LAYERS,
};
