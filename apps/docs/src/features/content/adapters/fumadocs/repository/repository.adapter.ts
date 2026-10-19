import { statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { gitConfig } from '#/shared/constants';

import { pageSlugsOf } from '../../../domain/utils';

/**
 * A path in the Constitution's repository, whose Markdown the site renders as GitHub shows it. The
 * site builds from its own folder; the path is resolved when asked, since the browser has none.
 */
const inRepository = (path = ''): string => resolve('../..', path);

/** the folders of the blocks' layers, by the site's folder of each; a platform and a language sit under contexts/ */
const BLOCK_LAYERS: Readonly<Record<string, string>> = {
  core: 'core',
  domains: 'domains',
  implementations: 'implementations',
  languages: 'contexts/languages',
  platforms: 'contexts/platforms',
};

const QUICK_START = 'quick-start';

/** the page made of PROJECT.md's glossary, and that section's anchor */
const GLOSSARY = 'glossary';

/** the repository's documents beside the README that the site renders, by the page each one becomes */
const SITE_DOCUMENTS: Readonly<Record<string, string>> = {
  'CONTRIBUTING.md': 'contributing',
  'DECISIONS.md': 'decisions',
};

/** the folder of the guides, each one a page of the site */
const DOCS_FOLDER = 'docs/';

/** the folder of the blocks, every file of them a page of the site */
const BLOCKS_FOLDER = 'packages/constitution/blocks/';

/** the site's folders of the layers */
const SITE_LAYERS = Object.keys(BLOCK_LAYERS);

/** the site's folder of the layer a path from the root names, when it names a layer's folder */
const blockLayerOf = (path: string): string | undefined =>
  SITE_LAYERS.find((layer) => path === `${BLOCKS_FOLDER}${BLOCK_LAYERS[layer]}`);

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

/**
 * The site's address of a file of the repository, by its path from the root: a page where the site
 * renders it, GitHub's view where it does not.
 */
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

/** a link's target as a path from the repository's root, when it is a file of it */
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
